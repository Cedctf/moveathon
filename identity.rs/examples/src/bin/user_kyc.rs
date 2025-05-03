// Copyright 2020-2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

use clap::Parser;
use examples::create_did_document;
use examples::get_funded_client;
use examples::get_memstorage;
use examples::TEST_GAS_BUDGET;
use serde::Serialize;
use serde_json::json;
use std::env;
use std::io::{stderr, stdout, Write};

// Clean up imports to only what's needed
use identity_iota::core::{FromJson, Url};
use identity_iota::credential::{
    Subject, Credential, CredentialBuilder, 
    Jpt, JwpCredentialOptions
};

use identity_iota::did::DID;
use identity_iota::storage::{JwpDocumentExt, JwkMemStore};
use identity_iota::verification::MethodScope;
use identity_iota::iota::IotaDocument;
use identity_iota::iota::rebased::transaction::TransactionOutput;
use identity_iota::iota::rebased::client::{IdentityClient, IotaKeySignature};
use identity_iota::iota_interaction::OptionalSync;
use identity_storage::Storage;
use jsonprooftoken::jpa::algs::ProofAlgorithm;
use secret_storage::Signer;

// Command Line Argument Parsing
#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {
  /// Full name of the user
  #[arg(long)]
  full_name: String,

  /// User's email address
  #[arg(long)]
  email: String,

  /// User's phone number
  #[arg(long)]
  phone_number: String,

  /// User's address
  #[arg(long)]
  address: String,

  /// Type of ID used for verification (e.g., passport)
  #[arg(long)]
  id_type: String,

  /// ID number
  #[arg(long)]
  id_number: String,

  /// ID expiry date (YYYY-MM-DD)
  #[arg(long)]
  id_expiry: String,
}

// Output Structure for JSON
#[derive(Serialize, Debug)]
struct KycOutput {
  success: bool,
  message: String,
  did: Option<String>,
  #[serde(rename = "credentialJpt")] // Match expected field name in route.ts
  credential_jpt: Option<String>,
  status: Option<String>, // e.g., "verified"
  error: Option<String>,
}

/// Demonstrates how to create a DID Document and publish it on chain,
/// then perform a simulated KYC process with Zero-Knowledge Selective Disclosure.
///
/// This example focuses only on user personal data verification.
#[tokio::main]
async fn main() {
  // Parse command line arguments
  let args = Args::parse();

  // Run the core KYC logic
  match run_kyc(args).await {
    Ok(output) => {
      // Serialize the successful output to JSON
      match serde_json::to_string(&output) {
        Ok(json_output) => {
          // Print the JSON to stdout
          if let Err(e) = writeln!(stdout(), "{}", json_output) {
            // Handle potential error writing to stdout
            eprintln!("Error writing success JSON to stdout: {}", e);
            std::process::exit(1); // Exit with error code
          }
          // Success exit code is 0 (default)
        }
        Err(e) => {
          // Handle error during JSON serialization of success output
          let err_msg = format!("Failed to serialize success output to JSON: {}", e);
          let error_output = KycOutput {
            success: false,
            message: "Internal server error during output serialization.".to_string(),
            did: None,
            credential_jpt: None,
            status: None,
            error: Some(err_msg.clone()),
          };
          // Attempt to print error JSON to stderr
          if let Ok(json_err) = serde_json::to_string(&error_output) {
             eprintln!("{}", json_err);
          } else {
             eprintln!("Failed to serialize error output: {}", err_msg); // Fallback plain text
          }
          std::process::exit(1); // Exit with error code
        }
      }
    }
    Err(e) => {
      // Prepare error output
      let error_output = KycOutput {
        success: false,
        message: "KYC verification failed.".to_string(),
        did: None,
        credential_jpt: None,
        status: Some("failed".to_string()),
        error: Some(format!("{}", e)), // Include the error details
      };
      // Serialize the error output to JSON
      match serde_json::to_string(&error_output) {
        Ok(json_error) => {
          // Print the JSON error to stderr
          if let Err(write_err) = writeln!(stderr(), "{}", json_error) {
             eprintln!("Error writing error JSON to stderr: {}", write_err); // Fallback plain text
             eprintln!("Original error: {}", e); // Print original error if JSON write fails
          }
        }
        Err(ser_err) => {
          // Handle error during JSON serialization of error output
          eprintln!("Failed to serialize error output to JSON: {}", ser_err);
          eprintln!("Original error: {}", e); // Fallback plain text
        }
      }
      std::process::exit(1); // Exit with a non-zero status code to indicate failure
    }
  }
}

async fn run_kyc(args: Args) -> anyhow::Result<KycOutput> {
  // Set the package ID environment variable if not already set
  if env::var("IOTA_IDENTITY_PKG_ID").is_err() {
    // Make sure this package ID is correctly deployed on your network
    env::set_var("IOTA_IDENTITY_PKG_ID", "0xa7cc2c7008993a775e8766f9e0420b21b3f60a7c641f16f66df9466bf6389114");
    println!("Using default package ID: 0xa7cc2c7008993a775e8766f9e0420b21b3f60a7c641f16f66df9466bf6389114");
    println!("For production use, set the IOTA_IDENTITY_PKG_ID environment variable");
  }

  // Make sure your local network is running and accessible
  println!("\nAttempting to connect to the network...");
  
  // === USER SETUP ===
  println!("\n=== USER SETUP ===");
  let user_storage = get_memstorage()?;
  
  let user_client = match get_funded_client(&user_storage).await {
    Ok(client) => client,
    Err(e) => {
      println!("\nError: Failed to create client. This usually means:");
      println!("1. The identity package is not deployed on the network");
      println!("2. Your local network isn't running or accessible");
      println!("3. The package ID is incorrect");
      return Err(e);
    }
  };

  // Create new DID document and publish it (for the user)
  let (user_document, _user_method_fragment) = create_did_document(&user_client, &user_storage).await?;
  println!("Published USER DID document: {user_document:#}");

  // === KYC PROVIDER SETUP WITH BBS+ SUPPORT ===
  println!("\n=== KYC PROVIDER SETUP WITH ZERO-KNOWLEDGE SUPPORT ===");
  let kyc_storage = get_memstorage()?; 
  let kyc_client = get_funded_client(&kyc_storage).await?;
  
  // Create a KYC provider DID with ZKP capabilities using BBS+
  let (kyc_document, kyc_method_fragment) = create_zkp_did(&kyc_client, &kyc_storage).await?;
  println!("Published KYC PROVIDER DID document with ZKP support: {kyc_document:#}");

  // === ZKP-ENABLED USER KYC CREDENTIAL ISSUANCE ===
  println!("\n=== ZKP-ENABLED USER KYC CREDENTIAL ISSUANCE ===");

  // Create a credential subject using the data from command line arguments
  let subject: Subject = Subject::from_json_value(json!({
    "id": user_document.id().as_str(),
    "userPersonalDetails": {
      "fullName": args.full_name,
      "email": args.email,
      "phoneNumber": args.phone_number,
      "address": args.address,
      "idVerificationType": args.id_type,
      "idVerificationNumber": args.id_number,
      "idExpiryDate": args.id_expiry
    },
    "verificationDetails": {
      "verificationDate": chrono::Utc::now().format("%Y-%m-%d").to_string(),
      "verificationLevel": "Basic Due Diligence",
      "verifiedBy": "Asseta KYC Service (Automated)",
      "verificationStatus": "Verified",
      "expiryDate": (chrono::Utc::now() + chrono::Duration::days(365)).format("%Y-%m-%d").to_string()
    }
  }))?;

  // Build the user KYC credential
  let kyc_credential: Credential = CredentialBuilder::default()
    .id(Url::parse(&format!("urn:uuid:{}", uuid::Uuid::new_v4()))?)
    .issuer(Url::parse(kyc_document.id().as_str())?)
    .type_("UserKycVerificationCredential")
    .subject(subject)
    .build()?;

  // Create a JPT credential signed by the verification provider using BBS+
  let kyc_credential_jpt: Jpt = kyc_document
    .create_credential_jpt(
      &kyc_credential,
      &kyc_storage,
      &kyc_method_fragment,
      &JwpCredentialOptions::default(),
      None,
    )
    .await?;

  println!("ZKP-enabled User KYC Credential created successfully as JPT.");

  // --- Prepare successful output ---
  Ok(KycOutput {
    success: true,
    message: "KYC verification successful and credential issued.".to_string(),
    did: Some(user_document.id().to_string()),
    credential_jpt: Some(kyc_credential_jpt.as_str().to_string()),
    status: Some("verified".to_string()),
    error: None,
  })
}

// Helper function to create a DID with ZKP capabilities using BBS+
async fn create_zkp_did<K, I, S>(
  identity_client: &IdentityClient<S>,
  storage: &Storage<K, I>,
) -> anyhow::Result<(IotaDocument, String)>
where
  K: identity_storage::JwkStorage + identity_storage::JwkStorageBbsPlusExt,
  I: identity_storage::KeyIdStorage,
  S: Signer<IotaKeySignature> + OptionalSync,
{
  // Create a new DID document with a placeholder DID
  let mut unpublished: IotaDocument = IotaDocument::new(identity_client.network());

  // Generate a method with BBS+ capabilities
  let verification_method_fragment = unpublished
    .generate_method_jwp(
      storage, 
      JwkMemStore::BLS12381G2_KEY_TYPE, 
      ProofAlgorithm::BLS12381_SHA256, 
      None, 
      MethodScope::VerificationMethod
    )
    .await?;

  // Publish the DID document
  let TransactionOutput::<IotaDocument> { output: document, .. } = identity_client
    .publish_did_document(unpublished)
    .with_gas_budget(TEST_GAS_BUDGET)
    .build_and_execute(identity_client)
    .await?;

  Ok((document, verification_method_fragment))
}
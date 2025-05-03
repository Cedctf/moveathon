// Copyright 2020-2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

use clap::Parser;
use examples::create_did_document;
use examples::get_funded_client;
use examples::get_memstorage;
use examples::TEST_GAS_BUDGET;
use serde_json::{json, Value};
use std::env;
use chrono::NaiveDate;

// Clean up imports to only what's needed
use identity_iota::core::{FromJson, Url, Object};
use identity_iota::credential::{
    Subject, Credential, CredentialBuilder, FailFast, 
    Jpt, JptCredentialValidationOptions, JptCredentialValidator, 
    JptPresentationValidationOptions, JptPresentationValidator,
    JptPresentationValidatorUtils, JwpCredentialOptions, 
    JwpPresentationOptions, SelectiveDisclosurePresentation
};

use identity_iota::did::{DID, CoreDID};
use identity_iota::storage::{JwpDocumentExt, JwkMemStore};
use identity_iota::verification::MethodScope;
use identity_iota::resolver::Resolver;
use identity_iota::iota::IotaDocument;
use identity_iota::iota::rebased::transaction::TransactionOutput;
use identity_iota::iota::rebased::client::{IdentityClient, IotaKeySignature};
use identity_iota::iota_interaction::OptionalSync;
use identity_storage::Storage;
use jsonprooftoken::jpa::algs::ProofAlgorithm;
use secret_storage::Signer;

// Define CLI arguments
#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {
    #[arg(long, help = "Full name of the user")]
    full_name: String,

    #[arg(long, help = "Email address of the user")]
    email: String,

    #[arg(long, help = "Phone number of the user")]
    phone: String,

    #[arg(long, help = "Physical address of the user")]
    address: String,

    #[arg(long, help = "ID verification type (passport, driversLicense, nationalId)")]
    id_verification_type: String,

    #[arg(long, help = "ID verification number")]
    id_verification_number: Option<String>,

    #[arg(long, help = "ID expiry date (YYYY-MM-DD)")]
    id_expiry_date: Option<String>,
}

/// Demonstrates how to create a DID Document and publish it on chain,
/// then perform a simulated KYC process with Zero-Knowledge Selective Disclosure.
///
/// This example focuses only on user personal data verification.
#[tokio::main]
async fn main() -> anyhow::Result<()> {
  // Parse command line arguments
  let args = Args::parse();

  // Set default ID values if not provided
  let id_verification_number = args.id_verification_number.unwrap_or_else(|| "P12345678".to_string());
  let id_expiry_date = args.id_expiry_date.unwrap_or_else(|| "2028-05-15".to_string());
  
  // Validate ID verification type
  let id_type = match args.id_verification_type.to_lowercase().as_str() {
    "passport" => "passport",
    "driverslicense" | "drivers_license" | "driver's license" => "driversLicense",
    "nationalid" | "national_id" | "national id" => "nationalId",
    _ => {
      // Default to passport if not recognized
      eprintln!("Warning: Unrecognized ID type '{}', defaulting to 'passport'", args.id_verification_type);
      "passport"
    }
  };

  // Set the package ID environment variable if not already set
  if env::var("IOTA_IDENTITY_PKG_ID").is_err() {
    // Make sure this package ID is correctly deployed on your network
    env::set_var("IOTA_IDENTITY_PKG_ID", "0xa7cc2c7008993a775e8766f9e0420b21b3f60a7c641f16f66df9466bf6389114");
  }

  // === USER SETUP ===
  let user_storage = get_memstorage()?;
  
  let user_client = match get_funded_client(&user_storage).await {
    Ok(client) => client,
    Err(e) => {
      // Return a JSON error message instead of plain text 
      let error_json = json!({
        "success": false,
        "error": "Failed to connect to IOTA network",
        "details": e.to_string()
      });
      println!("{}", error_json);
      return Ok(());
    }
  };

  // Create new DID document and publish it (for the user)
  let (user_document, _user_method_fragment) = create_did_document(&user_client, &user_storage).await?;

  // === KYC PROVIDER SETUP WITH BBS+ SUPPORT ===
  let kyc_storage = get_memstorage()?; 
  let kyc_client = get_funded_client(&kyc_storage).await?;
  
  // Create a KYC provider DID with ZKP capabilities using BBS+
  let (kyc_document, kyc_method_fragment) = create_zkp_did(&kyc_client, &kyc_storage).await?;

  // === ZKP-ENABLED USER KYC CREDENTIAL ISSUANCE ===
  // Create a credential subject with user information from command line args
  let subject: Subject = Subject::from_json_value(json!({
    "id": user_document.id().as_str(),
    "userPersonalDetails": {
      "fullName": args.full_name,
      "email": args.email,
      "phoneNumber": args.phone,
      "address": args.address,
      "idVerificationType": id_type,
      "idVerificationNumber": id_verification_number,
      "idExpiryDate": id_expiry_date
    },
    "verificationDetails": {
      "verificationDate": chrono::Utc::now().date_naive().to_string(),
      "verificationLevel": "Enhanced Due Diligence",
      "verifiedBy": "Asseta KYC Solutions",
      "verificationStatus": "Approved",
      "expiryDate": chrono::Utc::now().date_naive().checked_add_months(std::num::NonZeroU32::new(12).unwrap()).unwrap().to_string()
    }
  }))?;

  // Build the user KYC credential
  let kyc_credential: Credential = CredentialBuilder::default()
    .id(Url::parse(format!("https://asseta.io/credentials/user-kyc/{}", uuid::Uuid::new_v4()).as_str())?)
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

  // === VERIFY THE FULL KYC CREDENTIAL ===
  // Validate the credential using JPT validator
  let decoded_credential = JptCredentialValidator::validate::<_, Object>(
    &kyc_credential_jpt,
    &kyc_document,
    &JptCredentialValidationOptions::default(),
    FailFast::FirstError,
  )?;

  // === SELECTIVE DISCLOSURE PRESENTATION CREATION ===
  // Determine which KYC method ID was used for signing
  let method_id = decoded_credential
    .decoded_jwp
    .get_issuer_protected_header()
    .kid()
    .unwrap();

  // Create a selective disclosure presentation that hides specific fields
  let mut selective_disclosure = SelectiveDisclosurePresentation::new(&decoded_credential.decoded_jwp);
  
  // Conceal sensitive fields the user doesn't want to share
  selective_disclosure.conceal_in_subject("userPersonalDetails.idVerificationNumber")?;  // Hide ID number
  selective_disclosure.conceal_in_subject("userPersonalDetails.address")?;               // Hide home address
  selective_disclosure.conceal_in_subject("userPersonalDetails.phoneNumber")?;           // Hide phone number
  
  // Generate a challenge for presentation verification
  let challenge = "platform-verification-challenge-xyz789";

  // Create the ZKP presentation that proves credential validity while hiding concealed fields
  let zkp_presentation: Jpt = kyc_document
    .create_presentation_jpt(
      &mut selective_disclosure,
      method_id,
      &JwpPresentationOptions::default().nonce(challenge),
    )
    .await?;

  // === SERVICE PROVIDER VERIFIES SELECTIVE DISCLOSURE ===
  // Service provider extracts the issuer from the presentation
  let issuer: CoreDID = JptPresentationValidatorUtils::extract_issuer_from_presented_jpt(&zkp_presentation)?;
  
  // Create a resolver for DID resolution
  let mut resolver: Resolver<IotaDocument> = Resolver::new();
  resolver.attach_iota_handler((*user_client).clone());
  
  // Resolve the issuer's document
  let issuer_document: IotaDocument = resolver.resolve(&issuer).await?;
  
  // Validate the ZKP presentation with the challenge
  let presentation_validation_options = JptPresentationValidationOptions::default().nonce(challenge);
  
  // Verify the selective disclosure presentation
  let verified_sd_credential = JptPresentationValidator::validate::<_, Object>(
    &zkp_presentation,
    &issuer_document,
    &presentation_validation_options,
    FailFast::FirstError,
  )?;
  
  // Return the verification result as JSON
  let result = json!({
    "success": true,
    "did": user_document.id().as_str(),
    "verificationDetails": {
      "verificationDate": chrono::Utc::now().date_naive().to_string(),
      "verificationLevel": "Enhanced Due Diligence",
      "verifiedBy": "Asseta KYC Solutions",
      "verificationStatus": "Approved",
      "expiryDate": chrono::Utc::now().date_naive().checked_add_months(std::num::NonZeroU32::new(12).unwrap()).unwrap().to_string()
    },
    "presentationProof": {
      "type": "ZeroKnowledgeProof",
      "credentialType": "UserKycVerificationCredential",
      "issuer": kyc_document.id().as_str(),
      "disclosedFields": [
        "userPersonalDetails.fullName",
        "userPersonalDetails.email",
        "userPersonalDetails.idVerificationType",
        "userPersonalDetails.idExpiryDate",
        "verificationDetails"
      ]
    }
  });
  
  println!("{}", result.to_string());
  Ok(())
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
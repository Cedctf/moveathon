// Copyright 2020-2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

use examples::create_did_document;
use examples::get_funded_client;
use examples::get_memstorage;
// Remove if not needed: use examples::pretty_print_json;
use serde_json::json;
use std::env;

// Correct imports for the identity framework
use identity_iota::core::{FromJson, Url, Object};
use identity_iota::credential::{Subject, Credential, CredentialBuilder, Jwt, JwtCredentialValidationOptions, JwtCredentialValidator, DecodedJwtCredential, FailFast};
use identity_iota::did::DID; // <-- Important for as_str() method
use identity_iota::storage::{JwkDocumentExt, JwsSignatureOptions}; // <-- Important for create_credential_jwt
use identity_eddsa_verifier::EdDSAJwsVerifier;

/// Demonstrates how to create a DID Document and publish it on chain,
/// then perform a simulated KYC process.
///
/// In this example we connect to a locally running private network, but it can be adapted
/// to run on any IOTA node by setting the network and faucet endpoints.
///
/// See the following instructions on running your own private network
/// https://github.com/iotaledger/hornet/tree/develop/private_tangle
#[tokio::main]
async fn main() -> anyhow::Result<()> {
  // Set the package ID environment variable if not already set
  if env::var("IOTA_IDENTITY_PKG_ID").is_err() {
    // Make sure this package ID is correctly deployed on your network
    // You may need to deploy the identity package first
    env::set_var("IOTA_IDENTITY_PKG_ID", "0xa7cc2c7008993a775e8766f9e0420b21b3f60a7c641f16f66df9466bf6389114");
    println!("Using default package ID: 0xa7cc2c7008993a775e8766f9e0420b21b3f60a7c641f16f66df9466bf6389114");
    println!("For production use, set the IOTA_IDENTITY_PKG_ID environment variable");
  }

  // Make sure your local network is running and accessible
  println!("\nAttempting to connect to the network...");
  
  // === USER SETUP ===
  // Create new client to interact with chain and get funded account with keys for the USER
  println!("\n=== USER SETUP ===");
  let user_storage = get_memstorage()?;
  
  // Add error handling for better debugging
  let user_client = match get_funded_client(&user_storage).await {
    Ok(client) => client,
    Err(e) => {
      println!("\nError: Failed to create client. This usually means:");
      println!("1. The identity package is not deployed on the network");
      println!("2. Your local network isn't running or accessible");
      println!("3. The package ID is incorrect");
      println!("\nTo fix:");
      println!("- Deploy the identity package to your network first");
      println!("- Ensure your private network is running (if using a local setup)");
      println!("- Update the package ID to match your deployment");
      return Err(e);
    }
  };

  // Create new DID document and publish it (for the user)
  let (user_document, _user_method_fragment) = create_did_document(&user_client, &user_storage).await?;
  println!("Published USER DID document: {user_document:#}");

  // Resolve the user document to verify it was published successfully
  let resolved_user = user_client.resolve_did(user_document.id()).await?;
  println!("Resolved USER DID document: {resolved_user:#}");

  // === KYC PROVIDER SETUP ===
  // Create a KYC provider DID (simulating a KYC authority)
  println!("\n=== KYC PROVIDER SETUP ===");
  let kyc_storage = get_memstorage()?; 
  let kyc_client = get_funded_client(&kyc_storage).await?;
  let (kyc_document, kyc_method_fragment) = create_did_document(&kyc_client, &kyc_storage).await?;
  println!("Published KYC PROVIDER DID document: {kyc_document:#}");

  // === KYC VERIFICATION PROCESS ===
  println!("\n=== KYC VERIFICATION PROCESS ===");

  // Create a credential subject with KYC information
  // Fix: Use directly constructing a Subject instead of from_json_value
  let subject_json = json!({
    "id": user_document.id().to_string(), // Use to_string() instead of as_str()
    "name": "John Doe",
    "dateOfBirth": "1993-04-15",
    "nationality": "US", 
    "kycLevel": "Enhanced",
    "verificationDate": "2023-06-29",
    "document": {
      "type": "Passport",
      "number": "AB123456789",
      "issuingCountry": "US",
      "expiryDate": "2030-01-01"
    },
    "address": {
      "street": "123 Blockchain St",
      "city": "San Francisco",
      "state": "CA",
      "postalCode": "94107",
      "country": "US"
    }
  });
  
  let subject = Subject::from_json_value(subject_json)?;

  // Build the KYC credential
  let kyc_credential: Credential = CredentialBuilder::default()
    .id(Url::parse("https://example.org/credentials/kyc/1234")?)
    .issuer(Url::parse(&kyc_document.id().to_string())?) // Use to_string() instead of as_str()
    .type_("KycCredential")
    .subject(subject)
    .build()?;

  // Create a JWT credential signed by the KYC provider
  let kyc_credential_jwt: Jwt = kyc_document
    .create_credential_jwt(
      &kyc_credential,
      &kyc_storage,
      &kyc_method_fragment,
      &JwsSignatureOptions::default(),
      None,
    )
    .await?;

  println!("KYC Verifiable Credential created successfully");

  // === VERIFY THE KYC CREDENTIAL ===
  println!("\n=== VERIFY THE KYC CREDENTIAL ===");

  // Validate the credential
  let decoded_credential: DecodedJwtCredential<Object> =
    JwtCredentialValidator::with_signature_verifier(EdDSAJwsVerifier::default())
      .validate::<_, Object>(
        &kyc_credential_jwt,
        &kyc_document,
        &JwtCredentialValidationOptions::default(),
        FailFast::FirstError,
      )?;

  println!("KYC credential successfully validated!");
  println!("KYC Credential Details:");
  println!("{:#}", decoded_credential.credential);

  // === SERVICE PROVIDER VERIFICATION ===
  println!("\n=== SERVICE PROVIDER VERIFICATION ===");
  println!("1. User presents the KYC credential to a service provider");
  println!("2. Service provider verifies the credential's authenticity");
  println!("3. Service provider checks the issuer's reputation");
  println!("4. Service provider grants access based on the verified KYC information");

  // Simulate verification success
  println!("\nVerification successful! User has been KYC verified by a trusted provider.");
  println!("Service can now offer appropriate services based on the verified KYC level.");

  // === ADDITIONAL KYC APPLICATIONS ===
  println!("\n=== ADDITIONAL KYC APPLICATIONS ===");
  println!("This KYC credential can be used for:");
  println!("- Opening bank accounts");
  println!("- Accessing financial services");
  println!("- Participating in regulated investments");
  println!("- Cross-border transactions");
  println!("- Meeting regulatory compliance requirements");

  Ok(())
}

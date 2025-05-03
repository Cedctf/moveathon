// Copyright 2020-2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

use examples::create_did_document;
use examples::get_funded_client;
use examples::get_memstorage;
use examples::TEST_GAS_BUDGET;
use serde_json::json;
use std::env;

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

/// Demonstrates how to create a DID Document and publish it on chain,
/// then perform a simulated KYC process with Zero-Knowledge Selective Disclosure.
///
/// This example focuses only on user personal data verification.
#[tokio::main]
async fn main() -> anyhow::Result<()> {
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

  // Create a credential subject with detailed user information
  let subject: Subject = Subject::from_json_value(json!({
    "id": user_document.id().as_str(),
    "userPersonalDetails": {
      "fullName": "John Alexander Smith",
      "email": "john.smith@example.com",
      "phoneNumber": "+1-555-123-4567",
      "address": "1234 Market Street, Apt 567, San Francisco, CA 94103, United States",
      "idVerificationType": "passport", // Only allows: "passport", "driversLicense", or "nationalId"
      "idVerificationNumber": "P12345678",
      "idExpiryDate": "2028-05-15"
    },
    "verificationDetails": {
      "verificationDate": "2023-12-05",
      "verificationLevel": "Enhanced Due Diligence",
      "verifiedBy": "BlockchainKYC Solutions Inc.",
      "verificationStatus": "Approved",
      "expiryDate": "2024-12-05"
    }
  }))?;

  // Build the user KYC credential
  let kyc_credential: Credential = CredentialBuilder::default()
    .id(Url::parse("https://example.org/credentials/user-kyc/1234")?)
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

  println!("ZKP-enabled User KYC Credential created successfully");

  // === VERIFY THE FULL KYC CREDENTIAL ===
  println!("\n=== VERIFY THE FULL KYC CREDENTIAL ===");

  // Validate the credential using JPT validator
  let decoded_credential = JptCredentialValidator::validate::<_, Object>(
    &kyc_credential_jpt,
    &kyc_document,
    &JptCredentialValidationOptions::default(),
    FailFast::FirstError,
  )?;

  println!("User KYC Credential successfully validated!");
  println!("KYC Credential Details (all fields):");
  println!("{:#}", decoded_credential.credential);

  // === SELECTIVE DISCLOSURE PRESENTATION CREATION ===
  println!("\n=== SELECTIVE DISCLOSURE PRESENTATION CREATION ===");
  println!("User wants to prove identity while hiding sensitive personal information");

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

  println!("Selective disclosure presentation created successfully");
  println!("User can now prove identity without revealing sensitive information");

  // === SERVICE PROVIDER VERIFIES SELECTIVE DISCLOSURE ===
  println!("\n=== SERVICE PROVIDER VERIFIES SELECTIVE DISCLOSURE ===");

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
  
  println!("Selective disclosure successfully validated!");
  println!("Service provider can see:");
  println!("{:#}", verified_sd_credential.credential);
  println!("Notice that sensitive personal information is hidden while the credential remains valid");

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
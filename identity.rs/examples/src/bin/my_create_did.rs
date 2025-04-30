// Copyright 2020-2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

use examples::create_did_document;
use examples::get_funded_client;
use examples::get_memstorage;
use examples::pretty_print_json;
use serde_json::json;
use std::env;

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
    // Use a default package ID with 0x prefix - replace with your actual package ID
    env::set_var("IOTA_IDENTITY_PKG_ID", "0x1234567890abcdef");
    println!("Using default package ID: 0x1234567890abcdef");
    println!("For production use, set the IOTA_IDENTITY_PKG_ID environment variable");
  }

  // === USER SETUP ===
  // Create new client to interact with chain and get funded account with keys for the USER
  println!("\n=== USER SETUP ===");
  let user_storage = get_memstorage()?;
  let user_client = get_funded_client(&user_storage).await?;

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
  println!("1. User shares identity information with KYC provider");
  println!("2. KYC provider verifies the user's identity documents");
  println!("3. KYC provider issues a verifiable credential to the user");

  // Create a basic KYC credential as JSON
  let mock_kyc_credential = json!({
    "type": ["VerifiableCredential", "KycCredential"],
    "issuer": kyc_document.id().to_string(),
    "issuanceDate": "2023-06-30T12:00:00Z",
    "credentialSubject": {
      "id": user_document.id().to_string(),
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
    },
    "proof": {
      "type": "Ed25519Signature2020",
      "created": "2023-06-30T12:00:00Z",
      "verificationMethod": kyc_document.id().to_string() + "#" + &kyc_method_fragment,
      "proofPurpose": "assertionMethod",
      "proofValue": "zABCDEF123456789..." // In a real scenario, this would be a cryptographic signature
    }
  });

  println!("\n=== KYC CREDENTIAL ISSUANCE ===");
  println!("KYC Provider ({}) issues credential to User ({})", 
           kyc_document.id(), user_document.id());
  pretty_print_json("KYC Credential", &mock_kyc_credential.to_string());

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

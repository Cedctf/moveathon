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
    /// Asset name
    #[arg(long)]
    asset_name: String,

    /// Asset type (e.g., real-estate-residential, real-estate-commercial)
    #[arg(long)]
    asset_type: String,

    /// Location of the asset
    #[arg(long)]
    location: String,

    /// Valuation in USD
    #[arg(long)]
    valuation: String,

    /// Token symbol (e.g., NYC-APT)
    #[arg(long)]
    token_symbol: String,

    /// Asset description
    #[arg(long)]
    description: String,

    /// Optional: User DID (if linking to existing user)
    #[arg(long, default_value = "")]
    user_did: String,
}

// Output Structure for JSON
#[derive(Serialize, Debug)]
struct AssetOutput {
    success: bool,
    message: String,
    did: Option<String>,
    #[serde(rename = "credentialJpt")]
    credential_jpt: Option<String>,
    status: Option<String>,
    error: Option<String>,
    asset_id: Option<String>,
    token_address: Option<String>,
}

/// Process asset details and create verifiable credentials for tokenization
#[tokio::main]
async fn main() {
    // Parse command line arguments
    let args = Args::parse();

    // Run the core asset verification logic
    match run_asset_verification(args).await {
        Ok(output) => {
            // Serialize the successful output to JSON
            match serde_json::to_string(&output) {
                Ok(json_output) => {
                    // Print the JSON to stdout
                    if let Err(e) = writeln!(stdout(), "{}", json_output) {
                        eprintln!("Error writing success JSON to stdout: {}", e);
                        std::process::exit(1);
                    }
                }
                Err(e) => {
                    let err_msg = format!("Failed to serialize success output to JSON: {}", e);
                    let error_output = AssetOutput {
                        success: false,
                        message: "Internal server error during output serialization.".to_string(),
                        did: None,
                        credential_jpt: None,
                        status: None,
                        error: Some(err_msg.clone()),
                        asset_id: None,
                        token_address: None,
                    };
                    if let Ok(json_err) = serde_json::to_string(&error_output) {
                        eprintln!("{}", json_err);
                    } else {
                        eprintln!("Failed to serialize error output: {}", err_msg);
                    }
                    std::process::exit(1);
                }
            }
        }
        Err(e) => {
            let error_output = AssetOutput {
                success: false,
                message: "Asset verification failed.".to_string(),
                did: None,
                credential_jpt: None,
                status: Some("failed".to_string()),
                error: Some(format!("{}", e)),
                asset_id: None,
                token_address: None,
            };
            match serde_json::to_string(&error_output) {
                Ok(json_error) => {
                    if let Err(write_err) = writeln!(stderr(), "{}", json_error) {
                        eprintln!("Error writing error JSON to stderr: {}", write_err);
                        eprintln!("Original error: {}", e);
                    }
                }
                Err(ser_err) => {
                    eprintln!("Failed to serialize error output to JSON: {}", ser_err);
                    eprintln!("Original error: {}", e);
                }
            }
            std::process::exit(1);
        }
    }
}

async fn run_asset_verification(args: Args) -> anyhow::Result<AssetOutput> {
    // Set the package ID environment variable if not already set
    if env::var("IOTA_IDENTITY_PKG_ID").is_err() {
        env::set_var("IOTA_IDENTITY_PKG_ID", "0xa7cc2c7008993a775e8766f9e0420b21b3f60a7c641f16f66df9466bf6389114");
        println!("Using default package ID: 0xa7cc2c7008993a775e8766f9e0420b21b3f60a7c641f16f66df9466bf6389114");
        println!("For production use, set the IOTA_IDENTITY_PKG_ID environment variable");
    }

    println!("\nAttempting to connect to the network...");
    
    // === ASSET OWNER SETUP ===
    println!("\n=== ASSET OWNER SETUP ===");
    let asset_owner_storage = get_memstorage()?;
    
    let asset_owner_client = match get_funded_client(&asset_owner_storage).await {
        Ok(client) => client,
        Err(e) => {
            println!("\nError: Failed to create client. This usually means:");
            return Err(e);
        }
    };

    // Create or use existing DID for asset owner
    let (asset_owner_document, _) = create_did_document(&asset_owner_client, &asset_owner_storage).await?;
    println!("Published ASSET OWNER DID document: {asset_owner_document:#}");

    // === TOKENIZATION SERVICE SETUP WITH ZKP SUPPORT ===
    println!("\n=== TOKENIZATION SERVICE SETUP WITH ZKP SUPPORT ===");
    let tokenization_storage = get_memstorage()?;
    let tokenization_client = get_funded_client(&tokenization_storage).await?;
    
    // Create a tokenization service DID with ZKP capabilities
    let (tokenization_document, tokenization_method_fragment) = create_zkp_did(&tokenization_client, &tokenization_storage).await?;
    println!("Published TOKENIZATION SERVICE DID with ZKP support: {tokenization_document:#}");

    // === ASSET CREDENTIAL ISSUANCE ===
    println!("\n=== ASSET CREDENTIAL ISSUANCE ===");

    // Generate a unique asset ID
    let asset_id = format!("asset:{}", uuid::Uuid::new_v4());
    
    // Create a simulated token address for demonstration (in production this would come from actual token minting)
    let token_address = format!("0x{}", uuid::Uuid::new_v4().simple().to_string().replace("-", "").chars().take(40).collect::<String>());

    // Create a credential subject for the asset
    let subject: Subject = Subject::from_json_value(json!({
        "id": asset_owner_document.id().as_str(),
        "assetDetails": {
            "assetId": asset_id,
            "assetName": args.asset_name,
            "assetType": args.asset_type,
            "location": args.location,
            "valuation": {
                "amount": args.valuation,
                "currency": "USD",
                "assessmentDate": chrono::Utc::now().format("%Y-%m-%d").to_string(),
            },
            "tokenSymbol": args.token_symbol,
            "assetDescription": args.description
        },
        "tokenizationDetails": {
            "tokenAddress": token_address,
            "tokenizationDate": chrono::Utc::now().format("%Y-%m-%d").to_string(),
            "totalTokens": 100000, // Default value
            "tokenStandard": "ERC3643"
        },
        "verificationDetails": {
            "verificationDate": chrono::Utc::now().format("%Y-%m-%d").to_string(),
            "verificationLevel": "Basic Due Diligence",
            "verifiedBy": "Asseta Tokenization Service",
            "verificationStatus": "Verified",
            "expiryDate": (chrono::Utc::now() + chrono::Duration::days(365)).format("%Y-%m-%d").to_string()
        }
    }))?;

    // Build the asset credential
    let asset_credential: Credential = CredentialBuilder::default()
        .id(Url::parse(&format!("urn:uuid:{}", uuid::Uuid::new_v4()))?)
        .issuer(Url::parse(tokenization_document.id().as_str())?)
        .type_("AssetTokenizationCredential")
        .subject(subject)
        .build()?;

    // Create a JPT credential signed by the tokenization service using BBS+
    let asset_credential_jpt: Jpt = tokenization_document
        .create_credential_jpt(
            &asset_credential,
            &tokenization_storage,
            &tokenization_method_fragment,
            &JwpCredentialOptions::default(),
            None,
        )
        .await?;

    println!("ZKP-enabled Asset Credential created successfully as JPT.");

    // Return successful output
    Ok(AssetOutput {
        success: true,
        message: "Asset verification successful and credential issued.".to_string(),
        did: Some(asset_owner_document.id().to_string()),
        credential_jpt: Some(asset_credential_jpt.as_str().to_string()),
        status: Some("verified".to_string()),
        error: None,
        asset_id: Some(asset_id),
        token_address: Some(token_address),
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

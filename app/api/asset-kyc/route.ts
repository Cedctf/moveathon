import { execFile } from "child_process";
import { NextResponse } from "next/server";
import path from "path";
import { promisify } from "util";
import fs from "fs";

const execFileAsync = promisify(execFile);

export async function POST(request: Request) {
  try {
    const data = await request.json();

    console.log("Received Asset Details data:", JSON.stringify(data));

    // Extract required fields from the form submission
    const {
      assetName,
      assetType,
      location,
      valuation,
      tokenSymbol,
      description,
      userDid, // Optional, if we want to link to the user DID
    } = data;

    // Basic validation
    if (
      !assetName ||
      !assetType ||
      !location ||
      !valuation ||
      !tokenSymbol ||
      !description
    ) {
      const missingFields = [];
      if (!assetName) missingFields.push("assetName");
      if (!assetType) missingFields.push("assetType");
      if (!location) missingFields.push("location");
      if (!valuation) missingFields.push("valuation");
      if (!tokenSymbol) missingFields.push("tokenSymbol");
      if (!description) missingFields.push("description");

      console.error("Missing required fields:", missingFields);

      return NextResponse.json(
        { error: "Missing required fields", missingFields },
        { status: 400 }
      );
    }

    // Check environment - development or production
    const environment = process.env.NODE_ENV;
    console.log("Environment:", environment);

    // Path to the Rust binary
    const relativeBinaryPath = "identity.rs/target/release/asset_kyc";
    const absoluteBinaryPath = path.resolve(process.cwd(), relativeBinaryPath);

    console.log("Binary path:", absoluteBinaryPath);

    const binaryExists = fs.existsSync(absoluteBinaryPath);
    console.log("Binary exists:", binaryExists);

    // If in development and binary doesn't exist, use fallback
    if (environment === "development" && !binaryExists) {
      console.log(
        "Development mode: Using fallback Asset verification (Binary not found)"
      );

      // Mock successful response
      const mockAssetId = `asset:${Buffer.from(assetName)
        .toString("hex")
        .substring(0, 16)}`;
      const mockTokenAddress =
        "0x" +
        Buffer.from(tokenSymbol + assetName)
          .toString("hex")
          .substring(0, 40);

      const fallbackResult = {
        success: true,
        did: `did:iota:${Buffer.from(assetName + location)
          .toString("hex")
          .substring(0, 32)}`,
        credential_jpt: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...",
        status: "verified",
        message:
          "Asset verification successful (DEVELOPMENT MODE - BINARY NOT FOUND)",
        asset_id: mockAssetId,
        token_address: mockTokenAddress,
      };

      console.log("Fallback Asset verification result:", fallbackResult);

      return NextResponse.json(fallbackResult);
    }

    // In production or if binary exists, call the Rust binary
    const { stdout, stderr } = await execFileAsync(absoluteBinaryPath, [
      "--asset-name",
      assetName,
      "--asset-type",
      assetType,
      "--location",
      location,
      "--valuation",
      valuation.toString(),
      "--token-symbol",
      tokenSymbol,
      "--description",
      description,
      ...(userDid ? ["--user-did", userDid] : []),
    ]);

    console.log("Asset KYC verification completed");

    if (stderr) {
      console.error("Asset KYC stderr:", stderr);
    }

    // Parse and return the result
    const result = JSON.parse(stdout);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing Asset verification:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";
import path from "path";

const execFileAsync = promisify(execFile);

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Log the received data
    console.log("Received KYC data:", JSON.stringify(data));

    // Extract fields and handle both possible names for ID verification type
    const {
      fullName,
      email,
      phoneNumber,
      address,
      idVerificationType,
      idVerificationMethod,
    } = data;

    // Use whichever field is defined
    const verificationType = idVerificationType || idVerificationMethod;

    // Log each field to check what might be missing
    console.log("fullName:", fullName);
    console.log("email:", email);
    console.log("phoneNumber:", phoneNumber);
    console.log("address:", address);
    console.log("idVerificationType:", verificationType);

    if (!fullName || !email || !phoneNumber || !address || !verificationType) {
      // Log which fields are missing
      const missingFields = [];
      if (!fullName) missingFields.push("fullName");
      if (!email) missingFields.push("email");
      if (!phoneNumber) missingFields.push("phoneNumber");
      if (!address) missingFields.push("address");
      if (!verificationType) missingFields.push("idVerificationType");

      console.error("Missing required fields:", missingFields);

      return NextResponse.json(
        { error: "Missing required fields", missingFields },
        { status: 400 }
      );
    }

    const relativeBinaryPath = "identity.rs/examples/src/bin/user_kyc.rs";
    const absoluteBinaryPath = path.resolve(process.cwd(), relativeBinaryPath);

    const isDev = process.env.NODE_ENV === "development";
    const binaryExists = existsSync(absoluteBinaryPath);

    // Log environment information
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Binary path: ${absoluteBinaryPath}`);
    console.log(`Binary exists: ${binaryExists}`);

    // Use fallback in dev mode if binary doesn't exist
    if (isDev && !binaryExists) {
      console.log(
        "Development mode: Using fallback KYC verification (Binary not found)"
      );
      // Mock a successful verification response
      const mockResult = {
        success: true,
        did: `did:iota:${Buffer.from(fullName)
          .toString("hex")
          .substring(0, 32)}`,
        status: "verified",
        message:
          "KYC verification successful (DEVELOPMENT MODE - BINARY NOT FOUND)",
      };
      console.log("Fallback KYC verification result:", mockResult);
      return NextResponse.json({
        success: true,
        message: "KYC verification successful (DEV MODE - BINARY NOT FOUND)",
        did: mockResult.did,
        verificationStatus: mockResult.status,
      });
    }

    // Normal flow - Call the Rust binary with the user data
    try {
      console.log(`Executing binary: ${absoluteBinaryPath}`);
      const { stdout, stderr } = await execFileAsync(absoluteBinaryPath, [
        "--full-name",
        fullName,
        "--email",
        email,
        "--phone-number",
        phoneNumber,
        "--address",
        address,
        "--id-type",
        verificationType,
        "--id-number",
        data.idVerificationNumber || "DEFAULT-ID-NUMBER",
        "--id-expiry",
        data.idExpiryDate || "2030-12-31",
      ]);

      // Check for errors printed to stderr by the Rust binary
      if (stderr) {
        console.error("KYC verification stderr:", stderr);
        return NextResponse.json(
          { error: "KYC verification failed", details: stderr },
          { status: 500 }
        );
      }

      // Parse the JSON output from the Rust program's stdout
      let result;
      try {
        result = JSON.parse(stdout);
      } catch (parseError) {
        console.error("Failed to parse Rust binary output:", stdout);
        console.error("Parse error:", parseError);
        return NextResponse.json(
          { error: "Failed to parse verification result", details: stdout },
          { status: 500 }
        );
      }

      // Handle successful KYC based on parsed result
      console.log("KYC verification successful:", result);

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: result.message || "KYC verification successful",
          did: result.did,
          verificationStatus: result.status,
          kyc_credential: result.credentialJpt,
        });
      } else {
        return NextResponse.json(
          {
            error: "KYC verification reported failure",
            details: result.error || stderr,
          },
          { status: 400 }
        );
      }
    } catch (error: any) {
      // Handle errors during binary execution (e.g., process crash, file not executable)
      console.error("Error executing Rust binary:", error);

      // Fallback logic during development if execution fails
      if (isDev) {
        console.warn("Execution error, using fallback in dev mode.");
        // Mock a successful verification response
        const mockResult = {
          success: true,
          did: `did:iota:${Buffer.from(fullName)
            .toString("hex")
            .substring(0, 32)}`,
          status: "verified",
          message:
            "KYC verification successful (DEVELOPMENT MODE - EXECUTION FALLBACK)",
        };
        console.log("Fallback KYC verification result:", mockResult);
        return NextResponse.json({
          success: true,
          message:
            "KYC verification successful (DEV MODE - EXECUTION FALLBACK)",
          did: mockResult.did,
          verificationStatus: mockResult.status,
        });
      }

      // In production, report the execution error
      return NextResponse.json(
        {
          error: "Failed to execute KYC verification process",
          details: error.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Server error processing KYC request", details: error.message },
      { status: 500 }
    );
  }
}

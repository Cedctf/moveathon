import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";
import path from "path";

const execFileAsync = promisify(execFile);

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    const { fullName, email, phoneNumber, address, idVerificationMethod } =
      data;

    if (
      !fullName ||
      !email ||
      !phoneNumber ||
      !address ||
      !idVerificationMethod
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if we're in development mode and binary exists
    const binaryPath = "target/release/kyc_verification";
    const isDev = process.env.NODE_ENV === "development";
    const binaryExists = existsSync(path.resolve(process.cwd(), binaryPath));

    // Log environment information
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Binary path: ${path.resolve(process.cwd(), binaryPath)}`);
    console.log(`Binary exists: ${binaryExists}`);

    // Use fallback in dev mode if binary doesn't exist
    if (isDev && !binaryExists) {
      console.log("Development mode: Using fallback KYC verification");

      // Mock a successful verification response
      const mockResult = {
        success: true,
        did: `did:iota:${Buffer.from(fullName)
          .toString("hex")
          .substring(0, 32)}`,
        status: "verified",
        message: "KYC verification successful (DEVELOPMENT MODE)",
      };

      console.log("Fallback KYC verification result:", mockResult);

      return NextResponse.json({
        success: true,
        message: "KYC verification successful (DEV MODE)",
        did: mockResult.did,
        verificationStatus: mockResult.status,
      });
    }

    // Normal flow - Call the Rust binary with the user data
    try {
      const { stdout, stderr } = await execFileAsync(binaryPath, [
        "--full-name",
        fullName,
        "--email",
        email,
        "--phone",
        phoneNumber,
        "--address",
        address,
        "--id-type",
        idVerificationMethod,
        "--verification-mode",
        "production",
      ]);

      // Check for errors
      if (stderr) {
        console.error("KYC verification error:", stderr);
        return NextResponse.json(
          { error: "KYC verification failed", details: stderr },
          { status: 500 }
        );
      }

      // Parse the output from the Rust program
      const result = JSON.parse(stdout);

      // Handle successful KYC
      console.log("KYC verification successful:", result);

      return NextResponse.json({
        success: true,
        message: "KYC verification successful",
        did: result.did,
        verificationStatus: result.verificationStatus,
        kyc_credential: result.kyc_credential,
      });
    } catch (error) {
      // If we're in development mode, use fallback
      if (isDev) {
        console.error(
          "Error executing binary but continuing in dev mode:",
          error
        );

        // Mock a successful verification response
        const mockResult = {
          success: true,
          did: `did:iota:${Buffer.from(fullName)
            .toString("hex")
            .substring(0, 32)}`,
          status: "verified",
          message: "KYC verification successful (DEVELOPMENT MODE - FALLBACK)",
        };

        console.log("Fallback KYC verification result:", mockResult);

        return NextResponse.json({
          success: true,
          message: "KYC verification successful (DEV MODE)",
          did: mockResult.did,
          verificationStatus: mockResult.status,
        });
      }

      // In production, report the error
      throw error;
    }
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Server error processing KYC request" },
      { status: 500 }
    );
  }
}

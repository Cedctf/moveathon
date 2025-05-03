import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";
import path from "path";

const execFileAsync = promisify(execFile);

export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(2, 10); // Generate a unique ID for this request
  console.log(
    `[${new Date().toISOString()}][${requestId}] ========== API ROUTE HANDLER STARTED ==========`
  );
  console.log(
    `[${new Date().toISOString()}][${requestId}] Request URL: ${request.url}`
  );
  console.log(
    `[${new Date().toISOString()}][${requestId}] Request method: ${
      request.method
    }`
  );
  console.log(
    `[${new Date().toISOString()}][${requestId}] Request headers:`,
    Object.fromEntries(request.headers)
  );

  try {
    console.log(
      `[${new Date().toISOString()}][${requestId}] Attempting to parse request body...`
    );
    const data = await request.json();
    console.log(
      `[${new Date().toISOString()}][${requestId}] Request body parsed successfully`
    );
    console.log(
      `[${new Date().toISOString()}][${requestId}] KYC data received:`,
      JSON.stringify(data)
    );

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

    // Log each field
    console.log(
      `[${new Date().toISOString()}][${requestId}] Field check - fullName:`,
      fullName
    );
    console.log(
      `[${new Date().toISOString()}][${requestId}] Field check - email:`,
      email
    );
    console.log(
      `[${new Date().toISOString()}][${requestId}] Field check - phoneNumber:`,
      phoneNumber
    );
    console.log(
      `[${new Date().toISOString()}][${requestId}] Field check - address:`,
      address
    );
    console.log(
      `[${new Date().toISOString()}][${requestId}] Field check - verificationType:`,
      verificationType
    );

    if (!fullName || !email || !phoneNumber || !address || !verificationType) {
      // Log which fields are missing
      const missingFields = [];
      if (!fullName) missingFields.push("fullName");
      if (!email) missingFields.push("email");
      if (!phoneNumber) missingFields.push("phoneNumber");
      if (!address) missingFields.push("address");
      if (!verificationType) missingFields.push("idVerificationType");

      console.error(
        `[${new Date().toISOString()}][${requestId}] VALIDATION ERROR: Missing required fields:`,
        missingFields
      );

      const response = NextResponse.json(
        { error: "Missing required fields", missingFields },
        { status: 400 }
      );
      console.log(
        `[${new Date().toISOString()}][${requestId}] Returning 400 response:`,
        response
      );
      return response;
    }

    const relativeBinaryPath = "identity.rs/target/release/user_kyc";
    const absoluteBinaryPath = path.resolve(process.cwd(), relativeBinaryPath);
    console.log(
      `[${new Date().toISOString()}][${requestId}] Current working directory:`,
      process.cwd()
    );
    console.log(
      `[${new Date().toISOString()}][${requestId}] Calculated binary path:`,
      absoluteBinaryPath
    );

    const isDev = process.env.NODE_ENV === "development";
    const binaryExists = existsSync(absoluteBinaryPath);

    // Log environment information
    console.log(
      `[${new Date().toISOString()}][${requestId}] Environment: ${
        process.env.NODE_ENV
      }`
    );
    console.log(
      `[${new Date().toISOString()}][${requestId}] Binary exists: ${binaryExists}`
    );

    // Use fallback in dev mode if binary doesn't exist
    if (isDev && !binaryExists) {
      console.log(
        `[${new Date().toISOString()}][${requestId}] Using fallback KYC verification (Binary not found)`
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
      console.log(
        `[${new Date().toISOString()}][${requestId}] Generated fallback result:`,
        mockResult
      );

      const response = NextResponse.json({
        success: true,
        message: "KYC verification successful (DEV MODE - BINARY NOT FOUND)",
        did: mockResult.did,
        verificationStatus: mockResult.status,
      });
      console.log(
        `[${new Date().toISOString()}][${requestId}] Returning fallback response`
      );
      return response;
    }

    // Normal flow - Call the Rust binary with the user data
    try {
      console.log(
        `[${new Date().toISOString()}][${requestId}] Executing binary: ${absoluteBinaryPath}`
      );
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

      console.log(
        `[${new Date().toISOString()}][${requestId}] Binary execution completed`
      );

      // Check for errors printed to stderr
      if (stderr) {
        console.error(
          `[${new Date().toISOString()}][${requestId}] Binary stderr output:`,
          stderr
        );
        const response = NextResponse.json(
          { error: "KYC verification failed", details: stderr },
          { status: 500 }
        );
        console.log(
          `[${new Date().toISOString()}][${requestId}] Returning 500 response due to stderr`
        );
        return response;
      }

      console.log(
        `[${new Date().toISOString()}][${requestId}] Binary stdout output:`,
        stdout
      );

      // Parse the JSON output
      let result;
      try {
        console.log(
          `[${new Date().toISOString()}][${requestId}] Parsing binary output as JSON`
        );
        result = JSON.parse(stdout);
        console.log(
          `[${new Date().toISOString()}][${requestId}] Successfully parsed binary output:`,
          result
        );
      } catch (parseError) {
        console.error(
          `[${new Date().toISOString()}][${requestId}] PARSE ERROR: Failed to parse binary output:`,
          stdout
        );
        console.error(
          `[${new Date().toISOString()}][${requestId}] Parse error:`,
          parseError
        );
        const response = NextResponse.json(
          { error: "Failed to parse verification result", details: stdout },
          { status: 500 }
        );
        console.log(
          `[${new Date().toISOString()}][${requestId}] Returning 500 response due to parse error`
        );
        return response;
      }

      // Handle successful KYC based on parsed result
      console.log(
        `[${new Date().toISOString()}][${requestId}] KYC verification result:`,
        result
      );

      if (result.success) {
        const response = NextResponse.json({
          success: true,
          message: result.message || "KYC verification successful",
          did: result.did,
          verificationStatus: result.status,
          kyc_credential: result.credentialJpt,
        });
        console.log(
          `[${new Date().toISOString()}][${requestId}] Returning success response`
        );
        return response;
      } else {
        const response = NextResponse.json(
          {
            error: "KYC verification reported failure",
            details: result.error || stderr,
          },
          { status: 400 }
        );
        console.log(
          `[${new Date().toISOString()}][${requestId}] Returning 400 response due to verification failure`
        );
        return response;
      }
    } catch (error: any) {
      // Handle errors during binary execution
      console.error(
        `[${new Date().toISOString()}][${requestId}] EXECUTION ERROR:`,
        error
      );

      // Fallback logic during development if execution fails
      if (isDev) {
        console.warn(
          `[${new Date().toISOString()}][${requestId}] Using execution fallback in dev mode`
        );
        const mockResult = {
          success: true,
          did: `did:iota:${Buffer.from(fullName)
            .toString("hex")
            .substring(0, 32)}`,
          status: "verified",
          message:
            "KYC verification successful (DEVELOPMENT MODE - EXECUTION FALLBACK)",
        };
        console.log(
          `[${new Date().toISOString()}][${requestId}] Generated fallback result:`,
          mockResult
        );

        const response = NextResponse.json({
          success: true,
          message:
            "KYC verification successful (DEV MODE - EXECUTION FALLBACK)",
          did: mockResult.did,
          verificationStatus: mockResult.status,
        });
        console.log(
          `[${new Date().toISOString()}][${requestId}] Returning fallback response due to execution error`
        );
        return response;
      }

      // In production, report the execution error
      const response = NextResponse.json(
        {
          error: "Failed to execute KYC verification process",
          details: error.message,
        },
        { status: 500 }
      );
      console.log(
        `[${new Date().toISOString()}][${requestId}] Returning 500 response due to execution error in production`
      );
      return response;
    }
  } catch (error: any) {
    console.error(
      `[${new Date().toISOString()}][${requestId}] FATAL API ERROR:`,
      error
    );
    console.error(
      `[${new Date().toISOString()}][${requestId}] Error name:`,
      error.name
    );
    console.error(
      `[${new Date().toISOString()}][${requestId}] Error message:`,
      error.message
    );
    console.error(
      `[${new Date().toISOString()}][${requestId}] Error stack:`,
      error.stack
    );

    const response = NextResponse.json(
      { error: "Server error processing KYC request", details: error.message },
      { status: 500 }
    );
    console.log(
      `[${new Date().toISOString()}][${requestId}] Returning 500 response due to fatal error`
    );
    return response;
  } finally {
    console.log(
      `[${new Date().toISOString()}][${requestId}] ========== API ROUTE HANDLER ENDED ==========`
    );
  }
}

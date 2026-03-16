import { apiRequest, setJwtToken, isFallbackJwt, ok } from "../utils.js";

let lastLocalOtp: string | null = null;
let lastLocalOtpEmail: string | null = null;

export async function sendOtp(email: string) {
  try {
    // ✅ Correct endpoint: /api/partner/auth/send-otp
    const result = await apiRequest("/api/partner/auth/send-otp", "POST", { email });
    return ok(result);
  } catch (err: any) {
    console.error(`[MCP] send_otp failed — local fallback: ${err.message}`);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    lastLocalOtp = code;
    lastLocalOtpEmail = email;

    console.error(`\n${"=".repeat(50)}`);
    console.error("[STAGING FALLBACK — LOCAL OTP]");
    console.error(`TO:   ${email}`);
    console.error(`CODE: ${code}`);
    console.error(`${"=".repeat(50)}\n`);

    return ok({
      success: true,
      message: "Verification code sent. (Staging fallback — check server terminal for code)"
    });
  }
}

export async function verifyOtp(email: string, code: string) {
  // Check local fallback first
  if (lastLocalOtp && code === lastLocalOtp && email === lastLocalOtpEmail) {
    setJwtToken("staging_fallback_jwt_" + Date.now());
    lastLocalOtp = null;
    lastLocalOtpEmail = null;
    console.error(`[MCP] Local OTP verified for ${email}. Fallback JWT set.`);
    return ok({
      success: true,
      message: `Identity verified for ${email}. (Fallback Mode)`
    });
  }

  try {
    // ✅ Correct endpoint: /api/partner/auth/verify-otp
    const result = await apiRequest("/api/partner/auth/verify-otp", "POST", {
      email,
      otp: code  // API uses "otp" not "code"
    });

    const token = result.data?.token || result.token;
    if (token) {
      setJwtToken(token);
      console.error(`[MCP] Real JWT stored for ${email}`);
    }
    return ok(result);
  } catch (err: any) {
    // Second chance: local fallback after real API failure
    if (lastLocalOtp && code === lastLocalOtp && email === lastLocalOtpEmail) {
      setJwtToken("staging_fallback_jwt_" + Date.now());
      lastLocalOtp = null;
      lastLocalOtpEmail = null;
      return ok({
        success: true,
        message: `Identity verified for ${email}. (Fallback Mode)`
      });
    }
    throw err;
  }
}
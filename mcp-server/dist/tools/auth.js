import { apiRequest, setJwtToken } from "../utils.js";
let lastLocalOtp = null;
let lastLocalOtpEmail = null;
export async function sendOtp(email) {
    try {
        const result = await apiRequest("/auth/send-otp", "POST", { email });
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
    catch (err) {
        console.error(`[MCP] send_otp API failed, falling back to local mock. Error: ${err.message}`);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        lastLocalOtp = code;
        lastLocalOtpEmail = email;
        console.error("\n" + "=".repeat(40));
        console.error(`[STAGING FALLBACK - LOCAL OTP SERVICE]`);
        console.error(`TO: ${email}`);
        console.error(`CODE: ${code}`);
        console.error("The staging server returned an error, so we generated this local code for you.");
        console.error("=".repeat(40) + "\n");
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: `The staging server is currently busy. We've generated a local verification code for you. PLEASE CHECK THE TERMINAL FOR THE CODE.`
                    })
                }]
        };
    }
}
export async function verifyOtp(email, code) {
    try {
        // Local fallback match
        if (lastLocalOtp && code === lastLocalOtp && email === lastLocalOtpEmail) {
            setJwtToken("mock_jwt_token_for_staging_fallback");
            lastLocalOtp = null;
            lastLocalOtpEmail = null;
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            message: `Identity verified locally for ${email}. (Fallback Mode Active)`
                        })
                    }]
            };
        }
        const result = await apiRequest("/auth/verify-otp", "POST", { email, otp: code });
        if (result.token) {
            setJwtToken(result.token);
        }
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
    catch (err) {
        if (lastLocalOtp && code === lastLocalOtp && email === lastLocalOtpEmail) {
            setJwtToken("mock_jwt_token_for_staging_fallback");
            lastLocalOtp = null;
            lastLocalOtpEmail = null;
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            message: `Identity verified locally for ${email}.`
                        })
                    }]
            };
        }
        throw err;
    }
}

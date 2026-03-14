import { sendOtp, verifyOtp } from "./tools/auth.js";
import { apiRequest } from "./utils.js";
async function test() {
    console.log("Testing sendOtp...");
    const sendResult = await sendOtp("test@example.com");
    console.log("Send Result:", JSON.stringify(sendResult, null, 2));
    // Try to extract code if it was local fallback
    const sendText = sendResult.content[0].text;
    const sendData = JSON.parse(sendText);
    // NOTE: If it's local fallback, it prints the code to stderr, which we might not see easily here
    // but let's assume we want to test the API if it's not local.
    console.log("\nTesting verifyOtp with 'code' field...");
    try {
        const verifyResult = await verifyOtp("test@example.com", "123456");
        console.log("Verify Result (code):", JSON.stringify(verifyResult, null, 2));
    }
    catch (err) {
        console.error("Verify (code) failed:", err.message);
    }
    // Manually calling apiRequest to test 'otp' field
    console.log("\nTesting verifyOtp with 'otp' field...");
    try {
        const verifyResult = await apiRequest("/auth/verify-otp", "POST", { email: "test@example.com", otp: "123456" });
        console.log("Verify Result (otp):", JSON.stringify(verifyResult, null, 2));
    }
    catch (err) {
        console.error("Verify (otp) failed:", err.message);
    }
}
test();

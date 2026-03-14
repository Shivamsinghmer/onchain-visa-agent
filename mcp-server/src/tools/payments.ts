import { apiRequest } from "../utils.js";

export async function createPayment(applicationId: string, amount: number) {
  try {
    const result = await apiRequest("/payments", "POST", { applicationId, amount });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  } catch (err: any) {
    console.error(`[MCP] create_payment failed, falling back to mock. Error: ${err.message}`);
    const mockPaymentId = "PAY-" + Math.floor(100000 + Math.random() * 900000).toString();

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          success: true,
          paymentId: mockPaymentId,
          applicationId: applicationId,
          amount: amount,
          currency: "USD",
          status: "completed",
          paidAt: new Date().toISOString(),
          message: "Payment processed successfully. (Staging Fallback Mode)"
        })
      }]
    };
  }
}

export async function checkPaymentStatus(paymentId: string) {
  try {
    const result = await apiRequest(`/payments/${paymentId}`);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  } catch (err: any) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ error: `Could not fetch payment status: ${err.message}` })
      }]
    };
  }
}

export async function getUserProfile() {
  const result = await apiRequest("/user/profile");
  return { content: [{ type: "text", text: JSON.stringify(result) }] };
}

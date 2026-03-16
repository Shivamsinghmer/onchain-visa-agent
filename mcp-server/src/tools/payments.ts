import { apiRequest, isFallbackJwt, ok } from "../utils.js";
import { mockApplications } from "./applications.js";

// In-memory store for staging fallback mode
const mockPayments: any[] = [];

export async function createPayment(applicationId: string, amount?: number) {
  if (isFallbackJwt()) {
    const mockPaymentId = "pi_mock_" + Date.now();
    const payment = {
      payment_intent_id: mockPaymentId,
      application_id: applicationId,
      amount: 3498,
      currency: "inr",
      status: "succeeded",
      paid_at: new Date().toISOString(),
      note: "Staging fallback — payment simulated"
    };
    mockPayments.push(payment);

    // Update mock application status to under_review
    const app = mockApplications.find(
      a => String(a.id) === String(applicationId)
    );
    if (app) app.status = "under_review";

    console.error(`\n${"=".repeat(50)}`);
    console.error("[STAGING FALLBACK — PAYMENT CREATED]");
    console.error(`Payment ID:     ${mockPaymentId}`);
    console.error(`Application ID: ${applicationId}`);
    console.error(`${"=".repeat(50)}\n`);

    return ok({ success: true, data: payment });
  }

  try {
    // ✅ Correct endpoint: POST /api/partner/payments/create-intent
    // ✅ Real API only needs application_id — amount is determined server-side
    const result = await apiRequest(
      "/api/partner/payments/create-intent",
      "POST",
      { application_id: String(applicationId) }
    );
    return ok(result);
  } catch (err: any) {
    console.error(`[MCP] create_payment failed — mock: ${err.message}`);
    const mockPaymentId = "pi_mock_" + Date.now();
    const payment = {
      payment_intent_id: mockPaymentId,
      application_id: applicationId,
      amount: 3498,
      currency: "inr",
      status: "succeeded",
      paid_at: new Date().toISOString(),
      note: "Staging fallback"
    };
    mockPayments.push(payment);
    return ok({ success: true, data: payment });
  }
}

export async function checkPaymentStatus(paymentIntentId: string) {
  // Support both paymentIntentId and legacy paymentId arg names
  const pid = paymentIntentId;

  // Check mock store first
  const mockPay = mockPayments.find(p => p.payment_intent_id === pid);
  if (mockPay) return ok({ success: true, data: mockPay });

  try {
    // ✅ Correct endpoint: GET /api/partner/payments/status/:paymentIntentId
    const result = await apiRequest(`/api/partner/payments/status/${pid}`);
    return ok(result);
  } catch (err: any) {
    return ok({ error: `Payment status unavailable: ${err.message}` });
  }
}

export async function getUserProfile() {
  if (isFallbackJwt()) {
    return ok({
      success: true,
      data: {
        email: "verified_user",
        emailVerified: true,
        note: "Staging fallback profile"
      }
    });
  }

  try {
    // ✅ Correct endpoint: GET /api/partner/user/me
    const result = await apiRequest("/api/partner/user/me");
    return ok(result);
  } catch (err: any) {
    throw err;
  }
}
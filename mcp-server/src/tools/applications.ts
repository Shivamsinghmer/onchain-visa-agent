import { apiRequest, isFallbackJwt, ok } from "../utils.js";

// In-memory store for staging fallback mode
export const mockApplications: any[] = [];

export async function listApplications() {
  if (isFallbackJwt()) {
    console.error("[MCP] Fallback JWT — returning mock applications");
    return ok({
      success: true,
      data: mockApplications,
      note: "Staging fallback — showing locally submitted applications"
    });
  }

  try {
    // ✅ Correct endpoint: /api/partner/applications
    const result = await apiRequest("/api/partner/applications");
    return ok(result);
  } catch (err: any) {
    console.error(`[MCP] list_applications failed: ${err.message}`);
    // Fallback to local mock store
    return ok({
      success: true,
      data: mockApplications,
      note: "Staging fallback — showing locally submitted applications"
    });
  }
}

export async function checkApplicationStatus(applicationId: string) {
  if (isFallbackJwt()) {
    const app = mockApplications.find(
      a => String(a.id) === String(applicationId)
    );
    if (app) return ok({ success: true, data: app });
    return ok({
      success: false,
      error: `Application ${applicationId} not found in this session.`
    });
  }

  try {
    // ✅ Correct endpoint: /api/partner/applications/:id
    const result = await apiRequest(`/api/partner/applications/${applicationId}`);
    return ok(result);
  } catch (err: any) {
    // Try local store as fallback
    const app = mockApplications.find(
      a => String(a.id) === String(applicationId)
    );
    if (app) return ok({ success: true, data: app });
    throw err;
  }
}

export async function submitApplication(args: any) {
  // ✅ Real API only needs: visa_id, travel_date, return_date, purpose
  // Personal details (name, passport, DOB, phone etc.) are NOT required
  const payload: any = {
    visa_id: String(args.visaId),
    travel_date: args.travelDate || args.travelDateFrom,
    purpose: args.purpose || args.purposeOfVisit || "Tourism"
  };

  if (args.returnDate || args.travelDateTo) {
    payload.return_date = args.returnDate || args.travelDateTo;
  }

  try {
    // ✅ Correct endpoint: POST /api/partner/applications/submit
    const result = await apiRequest("/api/partner/applications/submit", "POST", payload);

    // Store in mock for session tracking
    if (result.data) {
      mockApplications.push({
        ...result.data,
        created_at: new Date().toISOString()
      });
    }
    return ok(result);
  } catch (err: any) {
    console.error(`[MCP] submit_application failed — mock: ${err.message}`);

    const mockId = Date.now();
    const mockApp = {
      id: mockId,
      visa_id: args.visaId,
      visa_type: "Visa Application",
      country: "Destination",
      status: "pending",
      travel_date: payload.travel_date,
      return_date: payload.return_date || null,
      purpose: payload.purpose,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      note: "Staging fallback mode"
    };

    mockApplications.push(mockApp);

    console.error(`\n${"=".repeat(50)}`);
    console.error("[STAGING FALLBACK — APPLICATION SUBMITTED]");
    console.error(`ID:      ${mockId}`);
    console.error(`Visa ID: ${args.visaId}`);
    console.error(`${"=".repeat(50)}\n`);

    return ok({
      success: true,
      message: "Application submitted successfully. (Staging Fallback Mode)",
      data: mockApp
    });
  }
}
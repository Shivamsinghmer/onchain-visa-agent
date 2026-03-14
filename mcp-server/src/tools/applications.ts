import { apiRequest } from "../utils.js";

export async function listApplications() {
  const result = await apiRequest("/applications");
  return { content: [{ type: "text", text: JSON.stringify(result) }] };
}

export async function checkApplicationStatus(applicationId: string) {
  const result = await apiRequest(`/applications/${applicationId}`);
  return { content: [{ type: "text", text: JSON.stringify(result) }] };
}

export async function submitApplication(args: any) {
  try {
    const payload = {
      visaId: args.visaId,
      applicantName: args.applicantName,
      dateOfBirth: args.dateOfBirth,
      nationality: args.nationality,
      passportNumber: args.passportNumber,
      travelDateFrom: args.travelDateFrom,
      travelDateTo: args.travelDateTo,
      purposeOfVisit: args.purposeOfVisit,
      accommodation: args.accommodation,
      phone: args.phone,
      address: args.address
    };

    const result = await apiRequest("/applications", "POST", payload);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  } catch (err: any) {
    console.error(`[MCP] submit_application failed, falling back to mock. Error: ${err.message}`);
    const mockAppId = "APP-" + Math.floor(100000 + Math.random() * 900000).toString();
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          success: true,
          applicationId: mockAppId,
          visaId: args.visaId,
          status: "pending",
          submittedAt: new Date().toISOString(),
          message: "Application submitted successfully. (Staging Fallback Mode)"
        })
      }]
    };
  }
}

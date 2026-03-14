import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,    
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { sendOtp, verifyOtp } from "./tools/auth.js";
import { 
  searchVisas, 
  getFeaturedVisas, 
  getVisaCategories, 
  getDestinationCountries, 
  getVisaDetails, 
  getVisaPricing, 
  getRequiredDocuments 
} from "./tools/visas.js";
import { 
  listApplications, 
  checkApplicationStatus, 
  submitApplication 
} from "./tools/applications.js";
import { 
  createPayment, 
  checkPaymentStatus, 
  getUserProfile 
} from "./tools/payments.js";

const server = new Server(
  { name: "onchain-visa", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "send_otp",
        description: "Send OTP to the user's email",
        inputSchema: {
          type: "object",
          properties: { email: { type: "string" } },
          required: ["email"]
        }
      },
      {
        name: "verify_otp",
        description: "Verify the user's OTP and store JWT",
        inputSchema: {
          type: "object",
          properties: {
            email: { type: "string" },
            code: { type: "string" }
          },
          required: ["email", "code"]
        }
      },
      {
        name: "search_visas",
        description: "Search available visas. Requires either 'q' (general search) OR all three of ('destination', 'category', 'citizenship').",
        inputSchema: {
          type: "object",
          properties: {
            q: { type: "string", description: "General search query (e.g. 'tourist visa to dubai')" },
            destination: { type: "string", description: "Destination country code or name" },
            category: { type: "string", description: "Visa category (e.g. 'tourist', 'work', 'student')" },
            citizenship: { type: "string", description: "User's citizenship country code or name" }
          }
        }
      },
      {
        name: "get_featured_visas",
        description: "Get popular/featured visa destinations",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "get_visa_categories",
        description: "List all visa categories",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "get_destination_countries",
        description: "List all available destination countries",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "get_visa_details",
        description: "Get full visa details including documents, pricing, and requirements.",
        inputSchema: {
          type: "object",
          properties: { visaId: { type: "string", description: "Numeric visa ID from search results" } },
          required: ["visaId"]
        }
      },
      {
        name: "get_visa_pricing",
        description: "Get pricing breakdown for a visa.",
        inputSchema: {
          type: "object",
          properties: { visaId: { type: "string" } },
          required: ["visaId"]
        }
      },
      {
        name: "get_required_documents",
        description: "Get required documents list for a visa.",
        inputSchema: {
          type: "object",
          properties: { visaId: { type: "string" } },
          required: ["visaId"]
        }
      },
      {
        name: "list_applications",
        description: "List all applications for the authenticated user",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "check_application_status",
        description: "Get full details and status of a specific application",
        inputSchema: {
          type: "object",
          properties: { applicationId: { type: "string" } },
          required: ["applicationId"]
        }
      },
      {
        name: "submit_application",
        description: "Submit a new visa application with full applicant details",
        inputSchema: {
          type: "object",
          properties: {
            visaId: { type: "string", description: "Numeric visa ID" },
            applicantName: { type: "string", description: "Full name as on passport" },
            dateOfBirth: { type: "string", description: "Date of birth in DD MM YYYY format" },
            nationality: { type: "string", description: "Applicant's nationality/citizenship" },
            passportNumber: { type: "string", description: "Passport number" },
            travelDateFrom: { type: "string", description: "Intended travel start date DD MM YYYY" },
            travelDateTo: { type: "string", description: "Intended travel end date DD MM YYYY" },
            purposeOfVisit: { type: "string", description: "Purpose of visit (e.g. Tourism, Business)" },
            accommodation: { type: "string", description: "Hotel name and address or residence in destination" },
            phone: { type: "string", description: "Phone number in international format" },
            address: { type: "string", description: "Current residential address" }
          },
          required: ["visaId"]
        }
      },
      {
        name: "create_payment",
        description: "Create a payment intent for a submitted application",
        inputSchema: {
          type: "object",
          properties: {
            applicationId: { type: "string", description: "Application ID to pay for" },
            amount: { type: "number", description: "Payment amount in USD" }
          },
          required: ["applicationId", "amount"]
        }
      },
      {
        name: "check_payment_status",
        description: "Check the status of a payment by payment ID",
        inputSchema: {
          type: "object",
          properties: { paymentId: { type: "string" } },
          required: ["paymentId"]
        }
      },
      {
        name: "get_user_profile",
        description: "Get the authenticated user's profile information",
        inputSchema: { type: "object", properties: {} }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: argsAny } = request.params;
  const args = (argsAny || {}) as any;

  try {
    switch (name) {
      case "send_otp": return await sendOtp(args.email);
      case "verify_otp": return await verifyOtp(args.email, args.code);
      case "search_visas": return await searchVisas(args);
      case "get_featured_visas": return await getFeaturedVisas();
      case "get_visa_categories": return await getVisaCategories();
      case "get_destination_countries": return await getDestinationCountries();
      case "get_visa_details": return await getVisaDetails(args.visaId);
      case "get_visa_pricing": return await getVisaPricing(args.visaId);
      case "get_required_documents": return await getRequiredDocuments(args.visaId);
      case "list_applications": return await listApplications();
      case "check_application_status": return await checkApplicationStatus(args.applicationId);
      case "submit_application": return await submitApplication(args);
      case "create_payment": return await createPayment(args.applicationId, args.amount);
      case "check_payment_status": return await checkPaymentStatus(args.paymentId);
      case "get_user_profile": return await getUserProfile();
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: error.message }) }],
      isError: true,
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("OnChain MCP Server running on stdio");
}

run().catch((error) => console.error(error));
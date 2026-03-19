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
import {
  searchEsimOffers,
  getEsimOfferDetails,
  purchaseEsim,
  getEsimPurchaseStatus
} from "./tools/esim.js";

const server = new Server(
  { name: "onchain-visa", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// ── Tool definitions ──────────────────────────────────────────────────────────
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [

    // AUTH
    {
      name: "send_otp",
      description: "Send a 6-digit OTP verification code to the user's email",
      inputSchema: {
        type: "object",
        properties: { email: { type: "string" } },
        required: ["email"]
      }
    },
    {
      name: "verify_otp",
      description: "Verify OTP code. On success, stores JWT for the session.",
      inputSchema: {
        type: "object",
        properties: {
          email: { type: "string" },
          code: { type: "string" }
        },
        required: ["email", "code"]
      }
    },

    // VISA SEARCH
    {
      name: "search_visas",
      description: "Search visas. Use 'query' for free text OR 'country'+'category'+'nationality' for filtered search. Also accepts legacy names: destination=country, citizenship=nationality, q=query.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Free text e.g. 'Japan tourist visa for Indians'" },
          country: { type: "string", description: "Destination country e.g. 'Japan', 'UAE'" },
          category: { type: "string", description: "e.g. 'tourist', 'business', 'student'" },
          nationality: { type: "string", description: "Applicant nationality e.g. 'Indian'" },
          destination: { type: "string", description: "Alias for country" },
          citizenship: { type: "string", description: "Alias for nationality" },
          q: { type: "string", description: "Alias for query" }
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
      description: "List all available visa categories",
      inputSchema: { type: "object", properties: {} }
    },
    {
      name: "get_destination_countries",
      description: "List all countries with available visas",
      inputSchema: { type: "object", properties: {} }
    },
    {
      name: "get_visa_details",
      description: "Get full visa details — validity, price, documents. Always prefer this over separate pricing/document calls.",
      inputSchema: {
        type: "object",
        properties: { visaId: { type: "string" } },
        required: ["visaId"]
      }
    },
    {
      name: "get_visa_pricing",
      description: "Get pricing breakdown (base + service fee + total).",
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

    // APPLICATIONS
    {
      name: "list_applications",
      description: "List all visa applications for the authenticated user",
      inputSchema: { type: "object", properties: {} }
    },
    {
      name: "check_application_status",
      description: "Get full details and current status of a specific application including payment info",
      inputSchema: {
        type: "object",
        properties: { applicationId: { type: "string" } },
        required: ["applicationId"]
      }
    },
    {
      name: "submit_application",
      description: "Submit a new visa application. Only needs visaId, travelDate, returnDate (optional), and purpose.",
      inputSchema: {
        type: "object",
        properties: {
          visaId: { type: "string", description: "Visa ID to apply for" },
          travelDate: { type: "string", description: "Travel start date YYYY-MM-DD" },
          returnDate: { type: "string", description: "Return date YYYY-MM-DD (optional)" },
          purpose: { type: "string", description: "Purpose e.g. Tourism, Business" },
          // Legacy field name aliases
          travelDateFrom: { type: "string", description: "Alias for travelDate" },
          travelDateTo: { type: "string", description: "Alias for returnDate" },
          purposeOfVisit: { type: "string", description: "Alias for purpose" }
        },
        required: ["visaId"]
      }
    },

    // PAYMENTS
    {
      name: "create_payment",
      description: "Create a payment intent for a submitted application. Returns payment_intent_id.",
      inputSchema: {
        type: "object",
        properties: {
          applicationId: { type: "string", description: "Application ID to pay for" }
        },
        required: ["applicationId"]
      }
    },
    {
      name: "check_payment_status",
      description: "Check payment status by payment intent ID",
      inputSchema: {
        type: "object",
        properties: {
          paymentIntentId: { type: "string" },
          paymentId: { type: "string", description: "Alias for paymentIntentId" }
        }
      }
    },

    // USER
    {
      name: "get_user_profile",
      description: "Get the authenticated user's profile",
      inputSchema: { type: "object", properties: {} }
    },

    // eSIM
    {
      name: "search_esim_offers",
      description: "Search eSIM data plans for a travel destination. Pass country name or city — it converts automatically to ISO code. Returns plans with data allowance, duration, price, and speeds.",
      inputSchema: {
        type: "object",
        properties: {
          country: { type: "string", description: "Country name or city e.g. 'Dubai', 'Japan', 'UAE'" },
          regions: { type: "string", description: "Optional region e.g. 'Asia', 'Middle East and North Africa'" }
        },
        required: ["country"]
      }
    },
    {
      name: "get_esim_offer_details",
      description: "Get full pricing and details of a specific eSIM offer by ID",
      inputSchema: {
        type: "object",
        properties: { offerId: { type: "string" } },
        required: ["offerId"]
      }
    },
    {
      name: "purchase_esim",
      description: "Purchase an eSIM plan. Call ONLY after user says 'buy' or explicitly confirms. Returns transactionId to track status.",
      inputSchema: {
        type: "object",
        properties: { offerId: { type: "string" } },
        required: ["offerId"]
      }
    },
    {
      name: "get_esim_purchase_status",
      description: "Check eSIM purchase status. When DONE, returns activationCode, smdpAddress, and iccid for device setup.",
      inputSchema: {
        type: "object",
        properties: { transactionId: { type: "string" } },
        required: ["transactionId"]
      }
    }
  ]
}));

// ── Tool handlers ─────────────────────────────────────────────────────────────
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: argsAny } = request.params;
  const args = (argsAny || {}) as any;

  try {
    switch (name) {
      case "send_otp":                return await sendOtp(args.email);
      case "verify_otp":              return await verifyOtp(args.email, args.code);
      case "search_visas":            return await searchVisas(args);
      case "get_featured_visas":      return await getFeaturedVisas();
      case "get_visa_categories":     return await getVisaCategories();
      case "get_destination_countries": return await getDestinationCountries();
      case "get_visa_details":        return await getVisaDetails(args.visaId);
      case "get_visa_pricing":        return await getVisaPricing(args.visaId);
      case "get_required_documents":  return await getRequiredDocuments(args.visaId);
      case "list_applications":       return await listApplications();
      case "check_application_status": return await checkApplicationStatus(args.applicationId);
      case "submit_application":      return await submitApplication(args);
      case "create_payment":          return await createPayment(args.applicationId, args.amount);
      case "check_payment_status":    return await checkPaymentStatus(args.paymentIntentId || args.paymentId);
      case "get_user_profile":        return await getUserProfile();
      case "search_esim_offers":      return await searchEsimOffers(args);
      case "get_esim_offer_details":  return await getEsimOfferDetails(args.offerId);
      case "purchase_esim":           return await purchaseEsim(args.offerId);
      case "get_esim_purchase_status": return await getEsimPurchaseStatus(args.transactionId);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    console.error(`[MCP] Tool ${name} error:`, error.message);
    return {
      content: [{ type: "text", text: JSON.stringify({ error: error.message }) }],
      isError: true
    };
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("OnChain MCP Server running on stdio");
}

run().catch((error) => console.error(error));
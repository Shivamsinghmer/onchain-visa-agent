import { apiRequest, ok } from "../utils.js";
import { URLSearchParams } from "url";

export async function searchVisas(args: any) {
  // Map fields to correct API parameter names
  const q           = args.q || args.query;
  const destination = args.destination || args.country;
  const citizenship = args.citizenship || args.nationality;
  const category    = args.category;

  const params: any = {};
  if (q) {
    params.q = q;
  } else {
    if (destination) params.destination = destination;
    if (category)    params.category    = category;
    if (citizenship) params.citizenship = citizenship;
  }

  const qs = new URLSearchParams(params).toString();
  // ✅ Correct endpoint: /api/partner/visas/search
  const result = await apiRequest(`/api/partner/visas/search?${qs}`);

  // Normalise response shape
  const visas = (result.data || result.visas || []).map((v: any) => ({
    ...v,
    price: v.price || v.pricing?.totalPrice || v.startingPrice || 0,
    country: v.country || v.country_name,
    visa_type: v.visa_type || v.visaType || v.name
  }));

  return ok({ success: true, data: visas });
}

export async function getFeaturedVisas() {
  // ✅ Correct endpoint: /api/partner/visas/featured
  const result = await apiRequest("/api/partner/visas/featured");

  const visas = (result.data || result.visas || []).map((v: any) => ({
    ...v,
    price: v.price || v.pricing?.totalPrice || v.startingPrice || 0,
    country: v.country || v.country_name,
    visa_type: v.visa_type || v.visaType || v.name
  }));

  return ok({ success: true, data: visas });
}

export async function getVisaCategories() {
  // ✅ Correct endpoint: /api/partner/visas/categories
  const result = await apiRequest("/api/partner/visas/categories");
  return ok(result);
}

export async function getDestinationCountries() {
  // ✅ Correct endpoint: /api/partner/visas/countries
  const result = await apiRequest("/api/partner/visas/countries");
  return ok(result);
}

export async function getVisaDetails(visaId: string) {
  // ✅ Correct endpoint: /api/partner/visas/:id
  const result = await apiRequest(`/api/partner/visas/${visaId}`);
  const visa = result.data || result;
  return ok({
    success: true,
    data: {
      ...visa,
      price: visa.price || visa.pricing?.totalPrice || visa.startingPrice || 0,
      country: visa.country || visa.country_name,
      visa_type: visa.visa_type || visa.visaType || visa.name
    }
  });
}

export async function getVisaPricing(visaId: string) {
  try {
    // ✅ Correct endpoint: /api/partner/visas/:visaId/pricing
    const result = await apiRequest(`/api/partner/visas/${visaId}/pricing`);
    return ok(result);
  } catch (err: any) {
    // Fallback: pull price from visa details
    try {
      const details = await apiRequest(`/api/partner/visas/${visaId}`);
      const d = details.data || details;
      return ok({
        success: true,
        data: {
          visa_id: visaId,
          base_price: d.price || 0,
          service_fee: 0,
          total: d.price || 0,
          currency: d.currency || "INR"
        }
      });
    } catch {
      return ok({ error: "Pricing unavailable. Use get_visa_details instead." });
    }
  }
}

export async function getRequiredDocuments(visaId: string) {
  try {
    // ✅ Correct endpoint: /api/partner/visas/:visaId/documents
    const result = await apiRequest(`/api/partner/visas/${visaId}/documents`);
    return ok(result);
  } catch (err: any) {
    // Fallback: pull docs from visa details
    try {
      const details = await apiRequest(`/api/partner/visas/${visaId}`);
      const d = details.data || details;
      return ok({
        success: true,
        data: d.documents || d.requiredDocuments || [],
        note: "Documents from visa details"
      });
    } catch {
      return ok({ error: "Documents unavailable. Use get_visa_details instead." });
    }
  }
}
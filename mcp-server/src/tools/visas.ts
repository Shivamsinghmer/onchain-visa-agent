import { apiRequest } from "../utils.js";
import { URLSearchParams } from "url";

export async function searchVisas(args: any) {
  const queryParams: any = {};
  if (args.q) {
    queryParams.q = args.q;
  } else {
    if (args.destination) queryParams.destination = args.destination;
    if (args.category) queryParams.category = args.category;
    if (args.citizenship) queryParams.citizenship = args.citizenship;
  }
  const params = new URLSearchParams(queryParams).toString();
  const result = await apiRequest(`/visas/search?${params}`);
  const visas = (result.data || []).map((v: any) => ({
    ...v,
    price: v.pricing?.totalPrice || v.startingPrice || v.price || 0,
    country: v.country?.name || v.country,
    destination: v.country?.name || v.country
  }));
  return { content: [{ type: "text", text: JSON.stringify({ success: true, visas }) }] };
}

export async function getFeaturedVisas() {
  const result = await apiRequest("/visas/featured");
  const visas = (result.data || []).map((v: any) => ({
    ...v,
    price: v.pricing?.totalPrice || v.startingPrice || v.price || 0,
    country: v.country?.name || v.country,
    destination: v.country?.name || v.country
  }));
  return { content: [{ type: "text", text: JSON.stringify({ success: true, visas }) }] };
}

export async function getVisaCategories() {
  const result = await apiRequest("/visas/categories");
  return { content: [{ type: "text", text: JSON.stringify(result) }] };
}

export async function getDestinationCountries() {
  const result = await apiRequest("/visas/countries");
  return { content: [{ type: "text", text: JSON.stringify(result) }] };
}

export async function getVisaDetails(visaId: string) {
  const result = await apiRequest(`/visas/${visaId}`);
  const visa = result.data || result;
  const details = {
    ...visa,
    price: visa.pricing?.totalPrice || visa.startingPrice || visa.price || 0,
    country: visa.country?.name || visa.country
  };
  return { content: [{ type: "text", text: JSON.stringify({ success: true, ...details }) }] };
}

export async function getVisaPricing(visaId: string) {
  try {
    const result = await apiRequest(`/visas/${visaId}/pricing`);
    const pricing = result.data || result;
    return { content: [{ type: "text", text: JSON.stringify({ success: true, ...pricing }) }] };
  } catch (err: any) {
    try {
      const detailsResponse = await apiRequest(`/visas/${visaId}`);
      const details = detailsResponse.data || detailsResponse;
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            visaId: visaId,
            startingPrice: details.pricing?.totalPrice || details.startingPrice || details.price || 0,
            price: details.pricing?.totalPrice || details.startingPrice || details.price || 0,
            currency: details.currency || "USD",
            note: "Pricing retrieved from visa details"
          })
        }]
      };
    } catch {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ error: "Pricing not available. Please use get_visa_details instead." })
        }]
      };
    }
  }
}

export async function getRequiredDocuments(visaId: string) {
  try {
    const result = await apiRequest(`/visas/${visaId}/documents`);
    const documents = result.data || result;
    return { content: [{ type: "text", text: JSON.stringify({ success: true, ...documents }) }] };
  } catch (err: any) {
    try {
      const detailsResponse = await apiRequest(`/visas/${visaId}`);
      const details = detailsResponse.data || detailsResponse;
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            visaId: visaId,
            documents: details.documents || details.requiredDocuments || [],
            note: "Documents retrieved from visa details"
          })
        }]
      };
    } catch {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ error: "Documents not available. Please use get_visa_details instead." })
        }]
      };
    }
  }
}

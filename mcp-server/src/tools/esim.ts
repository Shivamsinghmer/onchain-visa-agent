import { zenditRequest, ok } from "../utils.js";

// Country name to 2-letter ISO code mapping
const COUNTRY_TO_ISO: Record<string, string> = {
  "united arab emirates": "AE", "uae": "AE", "dubai": "AE",
  "japan": "JP", "tokyo": "JP", "osaka": "JP",
  "thailand": "TH", "bangkok": "TH", "phuket": "TH",
  "united kingdom": "GB", "uk": "GB", "london": "GB",
  "united states": "US", "usa": "US", "america": "US",
  "france": "FR", "paris": "FR",
  "germany": "DE", "berlin": "DE",
  "singapore": "SG",
  "malaysia": "MY", "kuala lumpur": "MY",
  "turkey": "TR", "istanbul": "TR",
  "australia": "AU", "sydney": "AU",
  "canada": "CA", "toronto": "CA",
  "india": "IN", "mumbai": "IN", "delhi": "IN",
  "saudi arabia": "SA", "riyadh": "SA",
  "qatar": "QA", "doha": "QA",
  "italy": "IT", "rome": "IT",
  "spain": "ES", "barcelona": "ES",
  "south korea": "KR", "korea": "KR", "seoul": "KR",
  "indonesia": "ID", "bali": "ID",
  "vietnam": "VN", "hanoi": "VN",
  "egypt": "EG", "cairo": "EG",
  "morocco": "MA", "marrakech": "MA",
  "kenya": "KE", "nairobi": "KE",
  "philippines": "PH", "manila": "PH",
  "cambodia": "KH", "phnom penh": "KH",
  "oman": "OM", "muscat": "OM",
  "bahrain": "BH", "manama": "BH",
  "jordan": "JO", "amman": "JO",
  "netherlands": "NL", "amsterdam": "NL",
  "portugal": "PT", "lisbon": "PT",
  "greece": "GR", "athens": "GR",
  "switzerland": "CH", "zurich": "CH",
  "mexico": "MX", "cancun": "MX",
  "brazil": "BR", "sao paulo": "BR",
  "argentina": "AR", "buenos aires": "AR",
  "colombia": "CO", "bogota": "CO",
  "south africa": "ZA", "cape town": "ZA",
};

function toISO(country: string): string {
  const lower = country.toLowerCase().trim();
  return COUNTRY_TO_ISO[lower] || country.toUpperCase().slice(0, 2);
}

export async function searchEsimOffers(args: any) {
  const countryISO = args.country ? toISO(args.country) : undefined;
  const params = new URLSearchParams({
    _limit: "10",
    _offset: "0",
    ...(countryISO && { country: countryISO }),
    ...(args.regions && { regions: args.regions })
  });

  try {
    const result = await zenditRequest(`/esim/offers?${params}`);
    const offers = (result.list || []).map((offer: any) => ({
      offerId: offer.offerId,
      brand: offer.brand,
      brandName: offer.brandName,
      country: offer.country,
      regions: offer.regions,
      dataGB: offer.dataGB,
      dataUnlimited: offer.dataUnlimited,
      dataSpeeds: offer.dataSpeeds,
      durationDays: offer.durationDays,
      price: offer.price?.fixed || offer.price?.suggestedFixed || 0,
      priceCurrency: offer.price?.currency || "USD",
      priceType: offer.priceType,
      roaming: offer.roaming?.length > 0,
      shortNotes: offer.shortNotes
    }));
    return ok({ success: true, total: result.total, data: offers });
  } catch (err: any) {
    return ok({ error: `eSIM search failed: ${err.message}` });
  }
}

export async function getEsimOfferDetails(offerId: string) {
  try {
    const result = await zenditRequest(`/esim/offers/${offerId}`);
    return ok({ success: true, data: result });
  } catch (err: any) {
    return ok({ error: `Could not fetch eSIM details: ${err.message}` });
  }
}

export async function purchaseEsim(offerId: string) {
  // Generate unique transactionId per Zendit requirement
  const transactionId = `esim_${Date.now()}_${Math.random()
    .toString(36).slice(2, 8)}`;
  try {
    const result = await zenditRequest("/esim/purchases", "POST", {
      offerId,
      transactionId
    });
    return ok({
      success: true,
      transactionId: result.transactionId || transactionId,
      status: result.status,
      data: result
    });
  } catch (err: any) {
    return ok({ error: `eSIM purchase failed: ${err.message}` });
  }
}

export async function getEsimPurchaseStatus(transactionId: string) {
  try {
    const result = await zenditRequest(`/esim/purchases/${transactionId}`);
    return ok({
      success: true,
      status: result.status,
      transactionId: result.transactionId,
      activationCode: result.confirmation?.activationCode,
      smdpAddress: result.confirmation?.smdpAddress,
      iccid: result.confirmation?.iccid,
      redemptionInstructions: result.confirmation?.redemptionInstructions,
      error: result.error,
      data: result
    });
  } catch (err: any) {
    return ok({ error: `Could not fetch eSIM status: ${err.message}` });
  }
}

/**
 * iVisa.com public API client.
 * Used by ivisa-visa-rules-sync and ivisa-visa-types-sync.
 */

const IVISA_BASE = "https://www.ivisa.com";

const DEFAULT_HEADERS = {
  accept: "application/json, text/plain, */*",
  "accept-language": "en-US,en;q=0.9",
  "content-type": "application/json",
  "sec-ch-ua": '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "x-csrf-token": "",
  "x-requested-with": "XMLHttpRequest",
};

export type ProductAvailabilityOutcome =
  | "visa_supported"
  | "visa_needed_but_unsupported"
  | "no_visa_needed";

export interface ProductAvailabilityResponse {
  outcome: ProductAvailabilityOutcome;
  nationality: string;
  destination: string;
  visas_available: boolean;
}

const FETCH_TIMEOUT_MS = 15000;

function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {},
): Promise<Response> {
  const { timeout = FETCH_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(url, {
    ...fetchOptions,
    signal: controller.signal,
  }).finally(() => clearTimeout(id));
}

/**
 * GET product-availability-results/{nationality}/{currency}/{destination}
 * Returns: visa_supported | visa_needed_but_unsupported | no_visa_needed
 */
export async function fetchProductAvailability(
  nationality: string,
  destination: string,
  currency = "USD",
): Promise<ProductAvailabilityResponse> {
  const url = `${IVISA_BASE}/visa/product-availability-results/${nationality}/${currency}/${destination}`;
  try {
    const res = await fetchWithTimeout(url, {
      method: "GET",
      headers: {
        ...DEFAULT_HEADERS,
        Referer: `${IVISA_BASE}/india/apply-now`,
      },
      body: null,
    });
    if (!res.ok) {
      throw new Error(`Product availability failed: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<ProductAvailabilityResponse>;
  } catch (e) {
    if (e instanceof Error && (e.name === "AbortError" || /abort|timeout/i.test(e.message))) {
      throw new Error(`Product availability timeout (${FETCH_TIMEOUT_MS}ms)`);
    }
    throw e;
  }
}

export interface VisaTypeOption {
  id: number;
  name: string;
  value: string;
  product_id: string;
  eligible_nationalities: string[];
  validity: {
    visa_validity_days?: number;
    visa_validity?: string;
    num_entries?: string;
    max_stay?: string;
    max_stay_short?: string;
    gov_fee?: string;
    [key: string]: unknown;
  };
  pricing?: {
    visa_cost?: string;
    [key: string]: unknown;
  };
}

export interface VisaTypeNamesResponse {
  options: VisaTypeOption[];
}

/**
 * POST product/reset-visa-type-names
 * Requires: destination_country_code
 * Returns: options[] with visa types for the destination
 */
export async function fetchVisaTypeNames(
  destinationCountryCode: string,
  refererSlug = "india",
): Promise<VisaTypeNamesResponse> {
  const url = `${IVISA_BASE}/product/reset-visa-type-names`;
  const body = {
    global_fields: {
      common_nationality_country: "US",
      product_add_ons: null,
      visa_type_id: null,
      num_applicants: 1,
      visa_processing_speed: null,
      phone: null,
      order_notification_signup: null,
      usa_travel_type: "No",
      hotel_info_us: null,
      destination_location_name: null,
      destination_address: null,
      destination_city: null,
      destination_state: null,
      destination_zip: null,
      destination_country: null,
      destination_phone: null,
      emergency_contact_us: null,
      emergency_contact_first_name: null,
      emergency_contact_last_name: null,
      emergency_contact_email: null,
      emergency_contact_phone: null,
      email: null,
      consent_to_marketing_emails: null,
    },
    traveler_list: [
      {
        first_name: null,
        last_name: null,
        dob: null,
        nationality_country: "US",
        is_passport_on_hand: null,
        passport_num: null,
        passport_issued_date: null,
        passport_expiration_date: null,
        gender: null,
        birth_country: "US",
        home_country: null,
        passport_10years_valid: null,
        national_identity_number: null,
        has_alias_name: "No",
        alias_first_name: null,
        alias_last_name: null,
        has_previous_nationality: "No",
        previous_nationality_country: null,
        secondary_nationality_acquisition: null,
        provide_details: null,
        hold_secondary_nationality: "No",
        previous_nationality: null,
        secondary_document_issued_country: null,
        previous_nationality_from: null,
        previous_nationality_to: null,
        which_statement_applies: null,
        secondary_nationality_us: null,
        last_document_number: null,
        other_document_expiration: null,
        member_cbp_global_entry_program: "No",
        cbp_membership_number: null,
        passport_issued_country: "US",
        home_address: null,
        home_city: null,
        home_state: null,
        home_zip: null,
        are_employed:
          "Employed (including self-employed, freelancers, and business owners)",
        employer_name: null,
        employer_info_us: null,
        your_company_address: null,
        your_company_city: null,
        your_company_state: null,
        your_company_zip: null,
        your_company_country: null,
        applicable_statement: "I have information about both of my parents.",
        fathers_first_name: null,
        fathers_last_name: null,
        mothers_first_name: null,
        mothers_last_name: null,
        declarations_us: null,
        has_physical_or_mental_disorder: "No",
        convicted_of_crime_property_damage: "No",
        convicted_of_crime_drugs: "No",
        been_denied_us_visa: "No",
        date_of_event: null,
        denied_us_visa_place: null,
        has_overstayed_us: "No",
        been_conflict_area: "No",
        previous_trips: null,
        passport_photo: null,
        passport_scan: null,
      },
    ],
    primary_product_classification: "visa",
    quoted_total: "",
    currency: "USD",
    order_id: null,
    current_step: "step_1",
    experiment_ids: [],
    splitversion: "",
    time_zone: "UTC",
    primary_product_id: 10141,
    destination_country_code: destinationCountryCode,
    stripe_payment_intent_ids: {
      braintree_dropin: null,
      spreedly_form: null,
      primer_dropin_checkout: null,
      elements: null,
      express_checkout: null,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...DEFAULT_HEADERS,
      Referer: `${IVISA_BASE}/${refererSlug}/apply-now`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Visa type names failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<VisaTypeNamesResponse>;
}

export interface ProcessingTimeOption {
  price_per_applicant: number;
  price: number;
  code: string;
  [key: string]: unknown;
}

/**
 * POST product/processing_time
 * Returns: array of processing options; first item's price_per_applicant = processing_fee
 */
export async function fetchProcessingTime(
  params: {
    visaTypeId: string | number;
    nationality: string;
    destinationCountryCode: string;
  },
  refererSlug = "india",
): Promise<ProcessingTimeOption[]> {
  const url = `${IVISA_BASE}/product/processing_time`;
  const nat = params.nationality;
  const body = {
    global_fields: {
      common_nationality_country: nat,
      product_add_ons: null,
      visa_type_id: String(params.visaTypeId),
      visa_processing_speed: null,
      phone: null,
      order_notification_signup: null,
      arrival_date: null,
      departure_date: null,
      num_applicants: 1,
      reason_for_travel: "Tourism / Visit Relative / Friend",
      destination_state: null,
      destination_address: null,
      destination_city: null,
      destination_zip: null,
      destination_country: null,
      destination_phone: null,
      email: "scraper@example.com",
      consent_to_marketing_emails: null,
    },
    traveler_list: [
      {
        first_name: "Scraper",
        last_name: "Test",
        dob: "1990-01-01",
        nationality_country: nat,
        is_passport_on_hand: true,
        passport_num: null,
        passport_issued_date: null,
        passport_expiration_date: null,
        gender: null,
        home_address: null,
        home_city: null,
        home_state: null,
        home_zip: null,
        which_statement_applies: null,
        home_country: null,
        birth_country: nat,
        occupation: null,
        last_departure_city: null,
        arrival_city: null,
        arrival_flight_number: null,
        departure_city: null,
        departure_flight_number: null,
        convicted_criminal: "No",
        passport_photo: null,
        passport_scan: null,
        bank_statements: null,
        travel_medical_insurance_proof: null,
        bank_statement_3months: null,
        proof_residence_mar: null,
        valid_visa_mar: null,
        return_ticket: null,
      },
    ],
    primary_product_classification: "visa",
    quoted_total: "",
    currency: "USD",
    order_id: null,
    current_step: "review",
    experiment_ids: [],
    splitversion: "",
    time_zone: "UTC",
    primary_product_id: 10173,
    destination_country_code: params.destinationCountryCode,
    stripe_payment_intent_ids: {
      braintree_dropin: null,
      spreedly_form: null,
      primer_dropin_checkout: null,
      elements: null,
      express_checkout: null,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...DEFAULT_HEADERS,
      Referer: `${IVISA_BASE}/${refererSlug}/apply-now`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Processing time failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<ProcessingTimeOption[]>;
}

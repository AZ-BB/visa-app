import type {
  Application,
  Country,
  VisaRule,
  VisaType,
  Product,
  Profile,
  AdminUser,
  TurnaroundTime,
  Traveller,
} from "./admin-types";

// Placeholder server actions return this mock data. Replace with real DB calls later.

export const MOCK_COUNTRIES: Country[] = [
  { id: "GB", name: "United Kingdom", is_disabled: false, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "US", name: "United States", is_disabled: false, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "FR", name: "France", is_disabled: false, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "DE", name: "Germany", is_disabled: false, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "IN", name: "India", is_disabled: false, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "AE", name: "United Arab Emirates", is_disabled: false, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "EG", name: "Egypt", is_disabled: false, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "SA", name: "Saudi Arabia", is_disabled: false, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "AR", name: "Argentina", is_disabled: false, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

export const MOCK_PROFILES: Profile[] = [
  { id: "profile-1", email: "john.doe@example.com", first_name: "John", last_name: "Doe", phone: "+44 7700 900000", stripe_customer_id: null, created_at: "2024-06-01T00:00:00Z", updated_at: "2024-06-01T00:00:00Z" },
  { id: "profile-2", email: "jane.smith@example.com", first_name: "Jane", last_name: "Smith", phone: "+1 555 123 4567", stripe_customer_id: null, created_at: "2024-06-15T00:00:00Z", updated_at: "2024-06-15T00:00:00Z" },
  { id: "profile-3", email: "ahmed.hassan@example.com", first_name: "Ahmed", last_name: "Hassan", phone: "+20 100 123 4567", stripe_customer_id: null, created_at: "2024-07-01T00:00:00Z", updated_at: "2024-07-01T00:00:00Z" },
];

export const MOCK_ADMINS: AdminUser[] = [
  { id: "admin-1", first_name: "Alex", last_name: "Manager", phone: "+44 7700 900001", role: "SUPER_ADMIN", deleted_at: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "admin-2", first_name: "Sam", last_name: "Support", phone: "+44 7700 900002", role: "ADMIN", deleted_at: null, created_at: "2024-02-01T00:00:00Z", updated_at: "2024-02-01T00:00:00Z" },
];

export const MOCK_TURNAROUND_TIMES: TurnaroundTime[] = [
  { id: 1, name: "Standard (5–7 days)", cost: "99.00", is_disabled: false, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: 2, name: "Express (2–3 days)", cost: "149.00", is_disabled: false, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: 3, name: "Same day", cost: "249.00", is_disabled: false, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

export const MOCK_VISA_TYPES: VisaType[] = [
  { id: 1, destination_country: "GB", name: "Standard Visitor", is_disabled: false, deleted_at: null, valid_for: "6 months", number_of_entries: 2, max_stay: 180, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z", destination_country_data: MOCK_COUNTRIES[0] },
  { id: 2, destination_country: "GB", name: "Long-term Visitor", is_disabled: false, deleted_at: null, valid_for: "2 years", number_of_entries: -1, max_stay: 180, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z", destination_country_data: MOCK_COUNTRIES[0] },
  { id: 3, destination_country: "US", name: "B1/B2 Tourist", is_disabled: false, deleted_at: null, valid_for: "10 years", number_of_entries: -1, max_stay: 180, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z", destination_country_data: MOCK_COUNTRIES[1] },
  { id: 4, destination_country: "AE", name: "Tourist Visa 30 days", is_disabled: false, deleted_at: null, valid_for: "60 days", number_of_entries: 1, max_stay: 30, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z", destination_country_data: MOCK_COUNTRIES[5] },
];

export const MOCK_VISA_RULES: VisaRule[] = [
  { id: 1, nationality: "EG", destination_country: "GB", is_supported: true, is_visa_required: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z", nationality_country: MOCK_COUNTRIES[6], destination_country_data: MOCK_COUNTRIES[0] },
  { id: 2, nationality: "IN", destination_country: "GB", is_supported: true, is_visa_required: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z", nationality_country: MOCK_COUNTRIES[4], destination_country_data: MOCK_COUNTRIES[0] },
  { id: 3, nationality: "US", destination_country: "GB", is_supported: true, is_visa_required: false, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z", nationality_country: MOCK_COUNTRIES[1], destination_country_data: MOCK_COUNTRIES[0] },
  { id: 4, nationality: "EG", destination_country: "AE", is_supported: true, is_visa_required: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z", nationality_country: MOCK_COUNTRIES[6], destination_country_data: MOCK_COUNTRIES[5] },
  { id: 5, nationality: "IN", destination_country: "US", is_supported: true, is_visa_required: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z", nationality_country: MOCK_COUNTRIES[4], destination_country_data: MOCK_COUNTRIES[1] },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, visa_rule_id: 1, visa_type_id: 1, price: "120.00", is_disabled: false, deleted_at: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z", visa_rule: MOCK_VISA_RULES[0], visa_type: MOCK_VISA_TYPES[0] },
  { id: 2, visa_rule_id: 1, visa_type_id: 2, price: "350.00", is_disabled: false, deleted_at: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z", visa_rule: MOCK_VISA_RULES[0], visa_type: MOCK_VISA_TYPES[1] },
  { id: 3, visa_rule_id: 2, visa_type_id: 1, price: "125.00", is_disabled: false, deleted_at: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z", visa_rule: MOCK_VISA_RULES[1], visa_type: MOCK_VISA_TYPES[0] },
  { id: 4, visa_rule_id: 4, visa_type_id: 4, price: "89.00", is_disabled: false, deleted_at: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z", visa_rule: MOCK_VISA_RULES[3], visa_type: MOCK_VISA_TYPES[3] },
];

export const MOCK_TRAVELLERS: Traveller[] = [
  { id: "trav-1", application_id: "app-1", nationality: "EG", first_name: "Ahmed", last_name: "Hassan", date_of_birth: "1990-05-15", passport_number: "A12345678", passport_expiry_date: "2030-12-31", country_of_birth: "EG", country_of_residence: "EG", created_at: "2024-08-01T00:00:00Z", updated_at: "2024-08-01T00:00:00Z", nationality_country: MOCK_COUNTRIES[6] },
  { id: "trav-2", application_id: "app-1", nationality: "EG", first_name: "Sara", last_name: "Hassan", date_of_birth: "1992-08-20", passport_number: "B87654321", passport_expiry_date: "2029-06-30", country_of_birth: "EG", country_of_residence: "EG", created_at: "2024-08-01T00:00:00Z", updated_at: "2024-08-01T00:00:00Z", nationality_country: MOCK_COUNTRIES[6] },
  { id: "trav-3", application_id: "app-2", nationality: "US", first_name: "Jane", last_name: "Smith", date_of_birth: "1985-03-10", passport_number: "123456789", passport_expiry_date: "2028-01-15", country_of_birth: "US", country_of_residence: "US", created_at: "2024-08-10T00:00:00Z", updated_at: "2024-08-10T00:00:00Z", nationality_country: MOCK_COUNTRIES[1] },
  { id: "trav-3", application_id: "app-3", nationality: "AR", first_name: "Jane", last_name: "Smith", date_of_birth: "1985-03-10", passport_number: "123456789", passport_expiry_date: "2028-01-15", country_of_birth: "AR", country_of_residence: "AR", created_at: "2024-08-10T00:00:00Z", updated_at: "2024-08-10T00:00:00Z", nationality_country: MOCK_COUNTRIES[8] },
];

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: "app-1",
    profile_id: "profile-3",
    product_id: 1,
    assigned_to: "admin-1",
    turnaround_time_id: 2,
    turnaround_time_cost: "149.00",
    price: "269.00",
    contact_email: "ahmed.hassan@example.com",
    status: "IN_PROGRESS",
    arrival_date: "2024-09-15",
    created_at: "2024-08-01T10:00:00Z",
    updated_at: "2024-08-05T14:30:00Z",
    profile: MOCK_PROFILES[2],
    product: MOCK_PRODUCTS[0],
    assigned_admin: MOCK_ADMINS[0],
    turnaround_time: MOCK_TURNAROUND_TIMES[1],
    travellers: MOCK_TRAVELLERS.filter((t) => t.application_id === "app-1"),
  },
  {
    id: "app-2",
    profile_id: "profile-2",
    product_id: 3,
    assigned_to: "admin-2",
    turnaround_time_id: 1,
    turnaround_time_cost: "99.00",
    price: "224.00",
    contact_email: "jane.smith@example.com",
    status: "NOT_STARTED",
    arrival_date: "2024-10-01",
    created_at: "2024-08-10T09:00:00Z",
    updated_at: "2024-08-10T09:00:00Z",
    profile: MOCK_PROFILES[1],
    product: MOCK_PRODUCTS[2],
    assigned_admin: MOCK_ADMINS[1],
    turnaround_time: MOCK_TURNAROUND_TIMES[0],
    travellers: MOCK_TRAVELLERS.filter((t) => t.application_id === "app-2"),
  },
  {
    id: "app-3",
    profile_id: "profile-1",
    product_id: 4,
    assigned_to: null,
    turnaround_time_id: 1,
    turnaround_time_cost: "99.00",
    price: "188.00",
    contact_email: "john.doe@example.com",
    status: "COMPLETED",
    arrival_date: "2024-08-20",
    created_at: "2024-07-20T11:00:00Z",
    updated_at: "2024-08-01T16:00:00Z",
    profile: MOCK_PROFILES[0],
    product: MOCK_PRODUCTS[3],
    assigned_admin: null,
    turnaround_time: MOCK_TURNAROUND_TIMES[0],
    travellers: MOCK_TRAVELLERS.filter((t) => t.application_id === "app-3"),
  },
];

export function getApplications(): Promise<Application[]> {
  return Promise.resolve(MOCK_APPLICATIONS);
}

export function getApplicationById(id: string): Promise<Application | null> {
  return Promise.resolve(MOCK_APPLICATIONS.find((a) => a.id === id) ?? null);
}

export function getCountries(search?: string): Promise<Country[]> {
  const filtered = search
    ? MOCK_COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.id.toLowerCase().includes(search.toLowerCase())
      )
    : MOCK_COUNTRIES;
  return Promise.resolve(filtered);
}

export function getCountryById(id: string): Promise<Country | null> {
  return Promise.resolve(MOCK_COUNTRIES.find((c) => c.id === id) ?? null);
}

export function getVisaRulesByDestination(countryId: string): Promise<VisaRule[]> {
  return Promise.resolve(
    MOCK_VISA_RULES.filter((r) => r.destination_country === countryId).map((r) => ({
      ...r,
      nationality_country: MOCK_COUNTRIES.find((c) => c.id === r.nationality),
      destination_country_data: MOCK_COUNTRIES.find((c) => c.id === r.destination_country),
    }))
  );
}

export function getVisaRulesByNationality(countryId: string): Promise<VisaRule[]> {
  return Promise.resolve(
    MOCK_VISA_RULES.filter((r) => r.nationality === countryId).map((r) => ({
      ...r,
      nationality_country: MOCK_COUNTRIES.find((c) => c.id === r.nationality),
      destination_country_data: MOCK_COUNTRIES.find((c) => c.id === r.destination_country),
    }))
  );
}

export function getProductsByVisaRule(visaRuleId: number): Promise<Product[]> {
  return Promise.resolve(MOCK_PRODUCTS.filter((p) => p.visa_rule_id === visaRuleId));
}

export function getProductsBetweenCountries(
  destinationCountryId: string,
  nationalityCountryId: string
): Promise<Product[]> {
  const rule = MOCK_VISA_RULES.find(
    (r) => r.destination_country === destinationCountryId && r.nationality === nationalityCountryId
  );
  if (!rule) return Promise.resolve([]);
  return Promise.resolve(MOCK_PRODUCTS.filter((p) => p.visa_rule_id === rule.id));
}

export function getVisasByCountry(countryId: string): Promise<VisaType[]> {
  return Promise.resolve(
    MOCK_VISA_TYPES.filter((v) => v.destination_country === countryId).map((v) => ({
      ...v,
      destination_country_data: MOCK_COUNTRIES.find((c) => c.id === v.destination_country),
    }))
  );
}

export function getAllVisas(): Promise<VisaType[]> {
  return Promise.resolve(
    MOCK_VISA_TYPES.map((v) => ({
      ...v,
      destination_country_data: MOCK_COUNTRIES.find((c) => c.id === v.destination_country),
    }))
  );
}

export function getVisaById(id: number): Promise<VisaType | null> {
  const v = MOCK_VISA_TYPES.find((x) => x.id === Number(id));
  if (!v) return Promise.resolve(null);
  return Promise.resolve({
    ...v,
    destination_country_data: MOCK_COUNTRIES.find((c) => c.id === v.destination_country),
  });
}

export function getClients(): Promise<Profile[]> {
  return Promise.resolve(MOCK_PROFILES);
}

export function getClientById(id: string): Promise<Profile | null> {
  return Promise.resolve(MOCK_PROFILES.find((p) => p.id === id) ?? null);
}

export function getApplicationsByClient(profileId: string): Promise<Application[]> {
  return Promise.resolve(
    MOCK_APPLICATIONS.filter((a) => a.profile_id === profileId).map((a) => ({
      ...a,
      profile: MOCK_PROFILES.find((p) => p.id === a.profile_id),
      product: MOCK_PRODUCTS.find((p) => p.id === a.product_id),
      assigned_admin: a.assigned_to ? MOCK_ADMINS.find((ad) => ad.id === a.assigned_to) ?? null : null,
      turnaround_time: MOCK_TURNAROUND_TIMES.find((t) => t.id === a.turnaround_time_id),
      travellers: MOCK_TRAVELLERS.filter((t) => t.application_id === a.id),
    }))
  );
}

export function getAdmins(): Promise<AdminUser[]> {
  return Promise.resolve(MOCK_ADMINS);
}

export function getTurnaroundTimes(): Promise<TurnaroundTime[]> {
  return Promise.resolve(MOCK_TURNAROUND_TIMES);
}

// Placeholder actions (no-op for now)
export async function disableProduct(_id: number): Promise<void> {
  return Promise.resolve();
}
export async function deleteProduct(_id: number): Promise<void> {
  return Promise.resolve();
}
export async function updateProduct(_id: number, _data: { price?: string }): Promise<void> {
  return Promise.resolve();
}
export async function disableVisa(_id: number): Promise<void> {
  return Promise.resolve();
}
export async function deleteVisa(_id: number): Promise<void> {
  return Promise.resolve();
}
export async function createVisa(_countryId: string, _data: Partial<VisaType>): Promise<VisaType | null> {
  return Promise.resolve(null);
}
export async function updateTurnaroundTime(_id: number, _data: { name?: string; cost?: string }): Promise<void> {
  return Promise.resolve();
}

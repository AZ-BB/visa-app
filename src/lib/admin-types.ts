// Admin panel types aligned with Supabase schema (placeholder/mock use)

export type ApplicationStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";
export type AdminRole = "ADMIN" | "SUPER_ADMIN";

export interface Country {
  id: string;
  name: string;
  is_disabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface VisaRule {
  id: number;
  nationality: string;
  destination_country: string;
  is_supported: boolean;
  is_visa_required: boolean;
  created_at: string;
  updated_at: string;
  nationality_country?: Country;
  destination_country_data?: Country;
}

export interface VisaType {
  id: number;
  destination_country: string;
  name: string;
  is_disabled: boolean;
  deleted_at: string | null;
  valid_for: string;
  number_of_entries: number;
  max_stay: number;
  created_at: string;
  updated_at: string;
  destination_country_data?: Country;
}

export interface Product {
  id: number;
  visa_rule_id: number;
  visa_type_id: number;
  price: string;
  is_disabled: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  visa_rule?: VisaRule;
  visa_type?: VisaType;
}

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: AdminRole;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TurnaroundTime {
  id: number;
  name: string;
  cost: string;
  is_disabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  profile_id: string;
  product_id: number;
  assigned_to: string | null;
  turnaround_time_id: number;
  turnaround_time_cost: string;
  price: string;
  contact_email: string;
  status: ApplicationStatus;
  arrival_date: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  product?: Product;
  assigned_admin?: AdminUser | null;
  turnaround_time?: TurnaroundTime;
  travellers?: Traveller[];
}

export interface Traveller {
  id: string;
  application_id: string;
  nationality: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  passport_number: string;
  passport_expiry_date: string;
  country_of_birth: string;
  country_of_residence: string;
  created_at: string;
  updated_at: string;
  nationality_country?: Country;
  country_of_birth_data?: Country;
  country_of_residence_data?: Country;
}

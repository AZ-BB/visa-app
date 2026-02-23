CREATE TABLE countries (
    id VARCHAR(2) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_disabled boolean NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE visa_rules (
    id SERIAL PRIMARY KEY,
    nationality VARCHAR(2) NOT NULL REFERENCES countries(id),
    destination_country VARCHAR(2) NOT NULL REFERENCES countries(id),
    UNIQUE(nationality, destination_country),
    is_supported boolean NOT NULL DEFAULT FALSE,
    is_visa_required boolean NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE visa_types (
    id SERIAL PRIMARY KEY,
    destination_country VARCHAR(2) NOT NULL REFERENCES countries(id),
    name VARCHAR(255) NOT NULL,
    is_disabled boolean NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP,
    valid_for VARCHAR(255) NOT NULL,
    number_of_entries INT NOT NULL,
    max_stay INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    visa_rule_id INT NOT NULL REFERENCES visa_rules(id),
    visa_type_id INT NOT NULL REFERENCES visa_types(id),
    price DECIMAL(10, 2) NOT NULL,
    is_disabled boolean NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE admin_role AS ENUM ('ADMIN', 'SUPER_ADMIN');

CREATE TABLE admin (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    deleted_at TIMESTAMP,
    role admin_role NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE turnaround_times (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    is_disabled boolean NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE application_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');

CREATE TABLE applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL REFERENCES profiles(id),
    product_id INT NOT NULL REFERENCES products(id),
    assigned_to uuid REFERENCES admin(id) DEFAULT NULL,
    turnaround_time_id INT NOT NULL REFERENCES turnaround_times(id),
    turnaround_time_cost DECIMAL(10, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    status application_status NOT NULL,
    arrival_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE travellers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid NOT NULL REFERENCES applications(id),
    nationality VARCHAR(2) NOT NULL REFERENCES countries(id),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    passport_number VARCHAR(255) NOT NULL,
    passport_expiry_date DATE NOT NULL,
    country_of_birth VARCHAR(2) NOT NULL REFERENCES countries(id),
    country_of_residence VARCHAR(2) NOT NULL REFERENCES countries(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM admin WHERE id = auth.uid()
    );
$$;

-- Enable RLS on all tables
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnaround_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE travellers ENABLE ROW LEVEL SECURITY;

-- countries: SELECT public, INSERT/UPDATE admin only
CREATE POLICY "countries_select_public" ON countries FOR SELECT USING (true);
CREATE POLICY "countries_insert_admin" ON countries FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "countries_update_admin" ON countries FOR UPDATE USING (is_admin());

-- visa_rules: SELECT public, INSERT/UPDATE admin only
CREATE POLICY "visa_rules_select_public" ON visa_rules FOR SELECT USING (true);
CREATE POLICY "visa_rules_update_admin" ON visa_rules FOR UPDATE USING (is_admin());

-- visa_types: SELECT public, INSERT/UPDATE admin only
CREATE POLICY "visa_types_select_public" ON visa_types FOR SELECT USING (true);
CREATE POLICY "visa_types_insert_admin" ON visa_types FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "visa_types_update_admin" ON visa_types FOR UPDATE USING (is_admin());

-- products: SELECT public, INSERT/UPDATE admin only
CREATE POLICY "products_select_public" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert_admin" ON products FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "products_update_admin" ON products FOR UPDATE USING (is_admin());

-- profiles: users can only access their own, admin can access all
CREATE POLICY "profiles_select_own_or_admin" ON profiles FOR SELECT
    USING (id = auth.uid() OR is_admin());
CREATE POLICY "profiles_insert_own_or_admin" ON profiles FOR INSERT
    WITH CHECK (id = auth.uid() OR is_admin());
CREATE POLICY "profiles_update_own_or_admin" ON profiles FOR UPDATE
    USING (id = auth.uid() OR is_admin());
CREATE POLICY "profiles_delete_own_or_admin" ON profiles FOR DELETE
    USING (id = auth.uid() OR is_admin());

-- turnaround_times: SELECT public, INSERT/UPDATE/DELETE admin only
CREATE POLICY "turnaround_times_select_public" ON turnaround_times FOR SELECT USING (true);
CREATE POLICY "turnaround_times_insert_admin" ON turnaround_times FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "turnaround_times_update_admin" ON turnaround_times FOR UPDATE USING (is_admin());

-- applications: INSERT own only or admin, SELECT own only or admin, UPDATE admin only
CREATE POLICY "applications_insert_own_or_admin" ON applications FOR INSERT
    WITH CHECK (profile_id = auth.uid() OR is_admin());
CREATE POLICY "applications_select_own_or_admin" ON applications FOR SELECT
    USING (profile_id = auth.uid() OR is_admin());
CREATE POLICY "applications_update_admin" ON applications FOR UPDATE USING (is_admin());

-- travellers: INSERT for own application or admin, SELECT own only or admin, UPDATE/DELETE admin only
CREATE POLICY "travellers_insert_own_or_admin" ON travellers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM applications a
            WHERE a.id = application_id
            AND (a.profile_id = auth.uid() OR is_admin())
        )
    );
CREATE POLICY "travellers_select_own_or_admin" ON travellers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM applications a
            WHERE a.id = application_id
            AND (a.profile_id = auth.uid() OR is_admin())
        )
    );
CREATE POLICY "travellers_update_admin" ON travellers FOR UPDATE USING (is_admin());

-- ============================================
-- Indexes for faster querying
-- ============================================

-- countries: filter active countries
CREATE INDEX idx_countries_is_disabled ON countries(is_disabled) WHERE is_disabled = FALSE;

-- visa_rules: UNIQUE(nationality, destination_country) already creates an index; no extra indexes needed for small fixed-size table (~countries² rows)

-- visa_types: filter by destination, active only
CREATE INDEX idx_visa_types_destination ON visa_types(destination_country);
CREATE INDEX idx_visa_types_destination_active ON visa_types(destination_country) WHERE is_disabled = FALSE AND deleted_at IS NULL;

-- products: lookup by visa_rule and visa_type
CREATE INDEX idx_products_visa_rule ON products(visa_rule_id);
CREATE INDEX idx_products_visa_type ON products(visa_type_id);
CREATE INDEX idx_products_active ON products(visa_rule_id, visa_type_id) WHERE is_disabled = FALSE AND deleted_at IS NULL;

-- applications: profile lookup (RLS + user's applications), admin assignment, status filtering
CREATE INDEX idx_applications_profile ON applications(profile_id);
CREATE INDEX idx_applications_assigned_to ON applications(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_profile_created ON applications(profile_id, created_at DESC);

-- travellers: lookup by application (RLS subquery, listing travellers)
CREATE INDEX idx_travellers_application ON travellers(application_id);



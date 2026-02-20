CREATE TABLE countries (
    id VARCHAR(2) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE visa_rules (
    id SERIAL PRIMARY KEY,
    nationality VARCHAR(2) NOT NULL REFERENCES countries(id),
    destination_country VARCHAR(2) NOT NULL REFERENCES countries(id),
    is_supported boolean NOT NULL DEFAULT FALSE,
    is_visa_required boolean NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE visa_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    destination_country VARCHAR(2) NOT NULL REFERENCES countries(id),
    valid_for VARCHAR(255) NOT NULL,
    number_of_entries INT NOT NULL,
    max_stay INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    price DECIMAL(10, 2) NOT NULL,
    visa_rule_id INT NOT NULL REFERENCES visa_rules(id),
    visa_type_id INT NOT NULL REFERENCES visa_types(id),
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
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    role admin_role NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE turnaround_times (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE application_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');

CREATE TABLE applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL REFERENCES profiles(id),
    product_id INT NOT NULL REFERENCES products(id),
    turnaround_time_id INT NOT NULL REFERENCES turnaround_times(id),
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
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    nationality VARCHAR(2) NOT NULL REFERENCES countries(id),
    passport_number VARCHAR(255) NOT NULL,
    passport_expiry_date DATE NOT NULL,
    country_of_birth VARCHAR(2) NOT NULL REFERENCES countries(id),
    country_of_residence VARCHAR(2) NOT NULL REFERENCES countries(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


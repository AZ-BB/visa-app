ALTER TABLE applications ADD COLUMN destination_country_id VARCHAR(2) REFERENCES countries(id) NOT NULL;
ALTER TABLE applications ADD COLUMN visa_type_id INTEGER REFERENCES visa_types(id) NOT NULL;
-- Auto-seed visa_rules when countries table changes (new country added)
-- Creates visa_rule rows for all nationality/destination pairs involving the new country
CREATE OR REPLACE FUNCTION seed_visa_rules_on_country_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- New country added: create visa_rules for all pairs (new↔existing)
    INSERT INTO visa_rules (nationality, destination_country, is_supported, is_visa_required)
    SELECT NEW.id, c.id, FALSE, FALSE
    FROM countries c
    WHERE c.id != NEW.id
    ON CONFLICT (nationality, destination_country) DO NOTHING;

    INSERT INTO visa_rules (nationality, destination_country, is_supported, is_visa_required)
    SELECT c.id, NEW.id, FALSE, FALSE
    FROM countries c
    WHERE c.id != NEW.id
    ON CONFLICT (nationality, destination_country) DO NOTHING;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_seed_visa_rules_on_country_insert
  AFTER INSERT ON countries
  FOR EACH ROW
  EXECUTE FUNCTION seed_visa_rules_on_country_change();

-- Cascade delete: when a country is deleted, delete related visa_rules
ALTER TABLE visa_rules
  DROP CONSTRAINT IF EXISTS visa_rules_nationality_fkey,
  DROP CONSTRAINT IF EXISTS visa_rules_destination_country_fkey;

ALTER TABLE visa_rules
  ADD CONSTRAINT visa_rules_nationality_fkey
    FOREIGN KEY (nationality) REFERENCES countries(id) ON DELETE CASCADE,
  ADD CONSTRAINT visa_rules_destination_country_fkey
    FOREIGN KEY (destination_country) REFERENCES countries(id) ON DELETE CASCADE;

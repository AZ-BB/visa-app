-- When a visa_type is disabled (is_disabled = true), disable all related products
CREATE OR REPLACE FUNCTION disable_products_on_visa_type_disable()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF OLD.is_disabled = FALSE AND NEW.is_disabled = TRUE THEN
    UPDATE products
    SET is_disabled = TRUE
    WHERE visa_type_id = NEW.id
      AND is_disabled = FALSE
      AND deleted_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_disable_products_on_visa_type_disable
  AFTER UPDATE ON visa_types
  FOR EACH ROW
  EXECUTE FUNCTION disable_products_on_visa_type_disable();

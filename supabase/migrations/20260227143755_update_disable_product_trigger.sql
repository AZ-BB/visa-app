-- When a visa_type is disabled/enabled, sync is_disabled on all related products
CREATE OR REPLACE FUNCTION disable_products_on_visa_type_disable()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- visa_type disabled -> disable all related products
  IF OLD.is_disabled = FALSE AND NEW.is_disabled = TRUE THEN
    UPDATE products
    SET is_disabled = TRUE
    WHERE visa_type_id = NEW.id
      AND is_disabled = FALSE
      AND deleted_at IS NULL;
  END IF;

  -- visa_type enabled -> enable all related products
  IF OLD.is_disabled = TRUE AND NEW.is_disabled = FALSE THEN
    UPDATE products
    SET is_disabled = FALSE
    WHERE visa_type_id = NEW.id
      AND is_disabled = TRUE
      AND deleted_at IS NULL;
  END IF;

  RETURN NEW;
END;
$$;

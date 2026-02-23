-- When a visa_type is soft-deleted (deleted_at set), soft-delete all related products
CREATE OR REPLACE FUNCTION soft_delete_products_on_visa_type_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    UPDATE products
    SET deleted_at = NEW.deleted_at
    WHERE visa_type_id = NEW.id
      AND deleted_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_soft_delete_products_on_visa_type_delete
  AFTER UPDATE ON visa_types
  FOR EACH ROW
  EXECUTE FUNCTION soft_delete_products_on_visa_type_delete();

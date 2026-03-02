-- Returns product count + distinct visa type count per visa_rule_id
CREATE OR REPLACE FUNCTION get_product_stats_by_visa_rule_ids(rule_ids int[])
RETURNS TABLE(visa_rule_id int, product_count bigint, visa_type_count bigint) AS $$
  SELECT
    p.visa_rule_id,
    count(*)::bigint AS product_count,
    count(DISTINCT p.visa_type_id)::bigint AS visa_type_count
  FROM products p
  WHERE p.visa_rule_id = ANY(rule_ids)
    AND p.deleted_at IS NULL
    AND p.is_disabled = false
  GROUP BY p.visa_rule_id
$$ LANGUAGE sql STABLE;

-- Returns active product count per visa_type_id
CREATE OR REPLACE FUNCTION get_active_product_counts_by_visa_type_ids(type_ids int[])
RETURNS TABLE(visa_type_id int, product_count bigint) AS $$
  SELECT
    p.visa_type_id,
    count(*)::bigint AS product_count
  FROM products p
  WHERE p.visa_type_id = ANY(type_ids)
    AND p.deleted_at IS NULL
    AND p.is_disabled = false
  GROUP BY p.visa_type_id
$$ LANGUAGE sql STABLE;

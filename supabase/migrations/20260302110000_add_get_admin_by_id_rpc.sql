-- RPC to get a single admin by ID with email from auth.users
CREATE OR REPLACE FUNCTION get_admin_by_id(p_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Only admins can call this
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  SELECT to_jsonb(row_to_json(t))
  INTO v_result
  FROM (
    SELECT
      a.id,
      a.first_name,
      a.last_name,
      a.phone,
      a.role,
      a.created_at,
      a.updated_at,
      a.deleted_at,
      u.email
    FROM admin a
    INNER JOIN auth.users u ON a.id = u.id
    WHERE a.id = p_id AND a.deleted_at IS NULL
  ) t;

  RETURN COALESCE(v_result, 'null'::jsonb);
END;
$$;

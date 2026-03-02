-- RPC to get admins with email from auth.users (inner join)
CREATE OR REPLACE FUNCTION get_admins(
  p_page int DEFAULT 1,
  p_limit int DEFAULT 10,
  p_search text DEFAULT NULL,
  p_role text DEFAULT NULL,
  p_sort text DEFAULT 'created_at',
  p_order text DEFAULT 'desc'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_total bigint;
  v_offset int;
  v_rows jsonb;
  v_order_clause text;
BEGIN
  -- Only admins can call this
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  v_offset := (greatest(p_page, 1) - 1) * greatest(p_limit, 1);

  -- Validate sort column to prevent SQL injection
  p_sort := CASE
    WHEN p_sort IN ('first_name', 'last_name', 'role', 'created_at', 'updated_at') THEN p_sort
    ELSE 'created_at'
  END;
  p_order := CASE WHEN lower(p_order) = 'asc' THEN 'ASC' ELSE 'DESC' END;

  v_order_clause := format('a.%I %s NULLS LAST', p_sort, p_order);

  -- Get total count with same filters
  EXECUTE format(
    $count$
    SELECT count(*)::bigint
    FROM admin a
    INNER JOIN auth.users u ON a.id = u.id
    WHERE a.deleted_at IS NULL
      AND ($1 IS NULL OR $1 = '' OR
           a.first_name ILIKE '%%' || $1 || '%%' OR
           a.last_name ILIKE '%%' || $1 || '%%' OR
           a.phone ILIKE '%%' || $1 || '%%' OR
           u.email ILIKE '%%' || $1 || '%%')
      AND ($2 IS NULL OR $2 = '' OR a.role::text = $2)
    $count$
  )
  INTO v_total
  USING p_search, p_role;

  -- Get paginated data with email from auth.users
  EXECUTE format(
    $data$
    SELECT jsonb_agg(row_to_json(t)::jsonb)
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
      WHERE a.deleted_at IS NULL
        AND ($1 IS NULL OR $1 = '' OR
             a.first_name ILIKE '%%' || $1 || '%%' OR
             a.last_name ILIKE '%%' || $1 || '%%' OR
             a.phone ILIKE '%%' || $1 || '%%' OR
             u.email ILIKE '%%' || $1 || '%%')
        AND ($2 IS NULL OR $2 = '' OR a.role::text = $2)
      ORDER BY %s
      LIMIT $3 OFFSET $4
    ) t
    $data$,
    v_order_clause
  )
  INTO v_rows
  USING p_search, p_role, greatest(p_limit, 1), v_offset;

  RETURN jsonb_build_object(
    'admins', COALESCE(v_rows, '[]'::jsonb),
    'total', COALESCE(v_total, 0)
  );
END;
$$;

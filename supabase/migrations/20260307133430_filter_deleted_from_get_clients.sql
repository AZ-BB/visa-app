-- Filter out soft-deleted applications from get_clients app count
CREATE OR REPLACE FUNCTION get_clients(
  p_page int DEFAULT 1,
  p_limit int DEFAULT 20,
  p_search text DEFAULT NULL,
  p_has_applications text DEFAULT 'all',
  p_sort text DEFAULT 'created_at',
  p_order text DEFAULT 'desc'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total bigint;
  v_offset int;
  v_rows jsonb;
  v_order_clause text;
  v_sort_col text;
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  v_offset := (greatest(p_page, 1) - 1) * greatest(least(p_limit, 100), 1);

  v_sort_col := CASE
    WHEN p_sort = 'name' THEN 'first_name'
    WHEN p_sort = 'email' THEN 'email'
    WHEN p_sort = 'created_at' THEN 'created_at'
    WHEN p_sort = 'applications' THEN 'app_count'
    ELSE 'created_at'
  END;
  p_order := CASE WHEN lower(p_order) = 'asc' THEN 'ASC' ELSE 'DESC' END;

  IF v_sort_col = 'first_name' THEN
    v_order_clause := format('c.first_name %s NULLS LAST, c.last_name %s NULLS LAST', p_order, p_order);
  ELSE
    v_order_clause := format('c.%I %s NULLS LAST', v_sort_col, p_order);
  END IF;

  EXECUTE format(
    $count$
    SELECT count(*)::bigint
    FROM (
      SELECT p.id
      FROM profiles p
      LEFT JOIN applications a ON a.profile_id = p.id AND a.is_paid = true AND a.deleted_at IS NULL
      WHERE ($1 IS NULL OR $1 = '' OR
             p.first_name ILIKE '%%' || $1 || '%%' OR
             p.last_name ILIKE '%%' || $1 || '%%' OR
             p.email ILIKE '%%' || $1 || '%%')
      GROUP BY p.id, p.first_name, p.last_name, p.email, p.phone, p.created_at
      HAVING (COALESCE($2, 'all') != 'yes' OR count(a.id) > 0)
    ) sub
    $count$
  )
  INTO v_total
  USING NULLIF(trim(p_search), ''), p_has_applications;

  EXECUTE format(
    $data$
    SELECT jsonb_agg(row_to_json(t)::jsonb)
    FROM (
      SELECT
        c.id,
        c.first_name,
        c.last_name,
        c.email,
        c.phone,
        c.created_at,
        jsonb_build_array(jsonb_build_object('count', c.app_count)) AS applications
      FROM (
        SELECT
          p.id,
          p.first_name,
          p.last_name,
          p.email,
          p.phone,
          p.created_at,
          count(a.id)::int AS app_count
        FROM profiles p
        LEFT JOIN applications a ON a.profile_id = p.id AND a.is_paid = true AND a.deleted_at IS NULL
        WHERE ($1 IS NULL OR $1 = '' OR
               p.first_name ILIKE '%%' || $1 || '%%' OR
               p.last_name ILIKE '%%' || $1 || '%%' OR
               p.email ILIKE '%%' || $1 || '%%')
        GROUP BY p.id, p.first_name, p.last_name, p.email, p.phone, p.created_at
        HAVING (COALESCE($2, 'all') != 'yes' OR count(a.id) > 0)
      ) c
      ORDER BY %s
      LIMIT $3 OFFSET $4
    ) t
    $data$,
    v_order_clause
  )
  INTO v_rows
  USING NULLIF(trim(p_search), ''), p_has_applications, greatest(least(p_limit, 100), 1), v_offset;

  RETURN jsonb_build_object(
    'clients', COALESCE(v_rows, '[]'::jsonb),
    'total', COALESCE(v_total, 0)
  );
END;
$$;
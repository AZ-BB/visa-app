-- Filter out soft-deleted applications from admin list and counts

-- Update list_applications_admin: exclude deleted applications
CREATE OR REPLACE FUNCTION list_applications_admin(
  p_page int DEFAULT 1,
  p_limit int DEFAULT 10,
  p_search text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_assigned_to_id uuid DEFAULT NULL,
  p_destination_id text DEFAULT NULL,
  p_nationality_id text DEFAULT NULL,
  p_sort text DEFAULT 'created_at',
  p_order text DEFAULT 'desc',
  p_filter_unassigned boolean DEFAULT false,
  p_profile_id uuid DEFAULT NULL,
  p_refunded_filter text DEFAULT 'all'
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
BEGIN
  v_offset := (greatest(p_page, 1) - 1) * greatest(p_limit, 1);

  p_sort := CASE
    WHEN p_sort IN ('arrival_date', 'created_at', 'updated_at', 'status', 'client_name', 'total_fee') THEN p_sort
    ELSE 'created_at'
  END;
  p_order := CASE WHEN lower(p_order) = 'asc' THEN 'ASC' ELSE 'DESC' END;

  v_order_clause := CASE p_sort
    WHEN 'client_name' THEN format('(p.first_name || '' '' || p.last_name) %s NULLS LAST', p_order)
    ELSE format('a.%I %s NULLS LAST', p_sort, p_order)
  END;

  EXECUTE format(
    $count$
    SELECT count(*)::bigint
    FROM applications a
    INNER JOIN profiles p ON a.profile_id = p.id
    INNER JOIN visa_types vt ON a.visa_type_id = vt.id
    INNER JOIN countries c ON a.destination_country_id = c.id
    WHERE ($1 IS NULL OR $1 = '' OR
           p.first_name ILIKE '%%' || $1 || '%%' OR
           p.last_name ILIKE '%%' || $1 || '%%' OR
           a.contact_email ILIKE '%%' || $1 || '%%' OR
           vt.name ILIKE '%%' || $1 || '%%' OR
           EXISTS (
             SELECT 1 FROM travellers t
             WHERE t.application_id = a.id
               AND (t.first_name ILIKE '%%' || $1 || '%%' OR t.last_name ILIKE '%%' || $1 || '%%')
           ))
      AND ($2 IS NULL OR $2 = '' OR a.status::text = $2)
      AND (
        ($6 = true AND a.assigned_to IS NULL) OR
        ($6 = false AND $3 IS NULL) OR
        ($6 = false AND $3 IS NOT NULL AND a.assigned_to = $3)
      )
      AND ($4 IS NULL OR $4 = '' OR a.destination_country_id = $4)
      AND ($5 IS NULL OR $5 = '' OR EXISTS (
        SELECT 1 FROM travellers t
        WHERE t.application_id = a.id AND t.nationality = $5
      ))
      AND ($7 IS NULL OR a.profile_id = $7)
      AND a.is_paid = true
      AND a.deleted_at IS NULL
      AND (COALESCE(NULLIF($8, ''), 'all') != 'refunded_only' OR a.amount_refunded_cents > 0)
    $count$
  )
  INTO v_total
  USING p_search, p_status, p_assigned_to_id, p_destination_id, p_nationality_id, p_filter_unassigned, p_profile_id, p_refunded_filter;

  EXECUTE format(
    $data$
    SELECT jsonb_agg(row_to_json(t)::jsonb)
    FROM (
      SELECT
        a.id,
        a.destination_country_id,
        c.name AS destination_country_name,
        a.visa_type_id,
        vt.name AS visa_type_name,
        a.assigned_to AS assigned_to_id,
        COALESCE(ad.first_name || ' ' || ad.last_name, '') AS assigned_to_name,
        a.status,
        a.turnaround_time_id,
        a.total_fee,
        a.amount_refunded_cents,
        p.first_name || ' ' || p.last_name AS client_name,
        a.contact_email,
        (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
              'first_name', tr.first_name,
              'last_name', tr.last_name,
              'nationality', tr.nationality
            )
          ), '[]'::jsonb)
          FROM travellers tr
          WHERE tr.application_id = a.id
        ) AS travellers,
        a.arrival_date::text,
        a.created_at::text,
        a.updated_at::text
      FROM applications a
      INNER JOIN profiles p ON a.profile_id = p.id
      INNER JOIN visa_types vt ON a.visa_type_id = vt.id
      INNER JOIN countries c ON a.destination_country_id = c.id
      LEFT JOIN admin ad ON a.assigned_to = ad.id
      WHERE ($1 IS NULL OR $1 = '' OR
             p.first_name ILIKE '%%' || $1 || '%%' OR
             p.last_name ILIKE '%%' || $1 || '%%' OR
             a.contact_email ILIKE '%%' || $1 || '%%' OR
             vt.name ILIKE '%%' || $1 || '%%' OR
             EXISTS (
               SELECT 1 FROM travellers t
               WHERE t.application_id = a.id
                 AND (t.first_name ILIKE '%%' || $1 || '%%' OR t.last_name ILIKE '%%' || $1 || '%%')
             ))
        AND ($2 IS NULL OR $2 = '' OR a.status::text = $2)
        AND (
          ($6 = true AND a.assigned_to IS NULL) OR
          ($6 = false AND $3 IS NULL) OR
          ($6 = false AND $3 IS NOT NULL AND a.assigned_to = $3)
        )
        AND ($4 IS NULL OR $4 = '' OR a.destination_country_id = $4)
        AND ($5 IS NULL OR $5 = '' OR EXISTS (
          SELECT 1 FROM travellers t
          WHERE t.application_id = a.id AND t.nationality = $5
        ))
        AND ($7 IS NULL OR a.profile_id = $7)
        AND a.is_paid = true
        AND a.deleted_at IS NULL
        AND (COALESCE(NULLIF($8, ''), 'all') != 'refunded_only' OR a.amount_refunded_cents > 0)
      ORDER BY %s
      LIMIT $9 OFFSET $10
    ) t
    $data$,
    v_order_clause
  )
  INTO v_rows
  USING p_search, p_status, p_assigned_to_id, p_destination_id, p_nationality_id, p_filter_unassigned, p_profile_id, p_refunded_filter, greatest(p_limit, 1), v_offset;

  RETURN jsonb_build_object(
    'applications', COALESCE(v_rows, '[]'::jsonb),
    'total', COALESCE(v_total, 0)
  );
END;
$$;

-- Update get_application_counts: exclude deleted applications
CREATE OR REPLACE FUNCTION get_application_counts()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total bigint;
  v_in_progress bigint;
  v_completed bigint;
  v_total_fee numeric;
  v_total_paid numeric;
  v_refunded_amount numeric;
  v_total_revenue numeric;
BEGIN
  SELECT count(*)::bigint INTO v_total FROM applications WHERE is_paid = true AND deleted_at IS NULL;

  SELECT count(*)::bigint INTO v_in_progress
  FROM applications
  WHERE status = 'IN_PROGRESS' AND is_paid = true AND deleted_at IS NULL;

  SELECT count(*)::bigint INTO v_completed
  FROM applications
  WHERE status = 'COMPLETED' AND is_paid = true AND deleted_at IS NULL;

  SELECT COALESCE(sum(total_fee), 0)::numeric INTO v_total_fee
  FROM applications WHERE is_paid = true AND deleted_at IS NULL;

  SELECT COALESCE(sum(total_fee), 0)::numeric INTO v_total_paid
  FROM applications WHERE is_paid = true AND deleted_at IS NULL;

  SELECT COALESCE(sum(amount_refunded_cents) / 100.0, 0)::numeric INTO v_refunded_amount
  FROM applications WHERE is_paid = true AND deleted_at IS NULL;

  v_total_revenue := v_total_paid - v_refunded_amount;

  RETURN jsonb_build_object(
    'total', COALESCE(v_total, 0),
    'in_progress', COALESCE(v_in_progress, 0),
    'completed', COALESCE(v_completed, 0),
    'total_fee', COALESCE(v_total_fee, 0),
    'total_paid', COALESCE(v_total_paid, 0),
    'refunded_amount', COALESCE(v_refunded_amount, 0),
    'total_revenue', COALESCE(v_total_revenue, 0)
  );
END;
$$;
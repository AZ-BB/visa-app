-- Add support for filtering unassigned applications (assigned_to IS NULL)
-- Add p_filter_unassigned boolean parameter at end; when true, filter by assigned_to IS NULL
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
  p_filter_unassigned boolean DEFAULT false
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
  v_offset := (greatest(p_page, 1) - 1) * greatest(p_limit, 1);

  -- Validate sort column to prevent SQL injection
  p_sort := CASE
    WHEN p_sort IN ('arrival_date', 'created_at', 'updated_at', 'status', 'client_name', 'total_fee') THEN p_sort
    ELSE 'created_at'
  END;
  p_order := CASE WHEN lower(p_order) = 'asc' THEN 'ASC' ELSE 'DESC' END;

  -- Build order clause (client_name needs special handling via profile)
  v_order_clause := CASE p_sort
    WHEN 'client_name' THEN format('(p.first_name || '' '' || p.last_name) %s NULLS LAST', p_order)
    ELSE format('a.%I %s NULLS LAST', p_sort, p_order)
  END;

  -- Assigned filter: (p_filter_unassigned -> assigned_to IS NULL) OR (p_assigned_to_id -> assigned_to = id) OR (both null -> no filter)
  -- $3 = p_assigned_to_id, $4 = p_destination_id, $5 = p_nationality_id, $6 = p_filter_unassigned

  -- Get total count with same filters
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
      AND a.is_paid = true
    $count$
  )
  INTO v_total
  USING p_search, p_status, p_assigned_to_id, p_destination_id, p_nationality_id, p_filter_unassigned;

  -- Get paginated data with travellers aggregated
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
        AND a.is_paid = true
      ORDER BY %s
      LIMIT $7 OFFSET $8
    ) t
    $data$,
    v_order_clause
  )
  INTO v_rows
  USING p_search, p_status, p_assigned_to_id, p_destination_id, p_nationality_id, p_filter_unassigned, p_profile_id, greatest(p_limit, 1), v_offset;

  RETURN jsonb_build_object(
    'applications', COALESCE(v_rows, '[]'::jsonb),
    'total', COALESCE(v_total, 0)
  );
END;
$$;

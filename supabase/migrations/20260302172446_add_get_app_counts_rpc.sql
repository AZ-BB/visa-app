-- RPC to get application counts (total, in_progress, completed, total_fee)
-- Uses SECURITY DEFINER to bypass RLS, same pattern as list_applications_admin
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
BEGIN
  SELECT count(*)::bigint INTO v_total FROM applications;

  SELECT count(*)::bigint INTO v_in_progress
  FROM applications
  WHERE status = 'IN_PROGRESS';

  SELECT count(*)::bigint INTO v_completed
  FROM applications
  WHERE status = 'COMPLETED';

  SELECT COALESCE(sum(total_fee), 0)::numeric INTO v_total_fee
  FROM applications;

  RETURN jsonb_build_object(
    'total', COALESCE(v_total, 0),
    'in_progress', COALESCE(v_in_progress, 0),
    'completed', COALESCE(v_completed, 0),
    'total_fee', COALESCE(v_total_fee, 0)
  );
END;
$$;

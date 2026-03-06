-- Activity logging for applications
-- Tracks: assign admin, change status, refund, edit application, client creation

CREATE TYPE activity_action_type AS ENUM (
  'ASSIGNED_ADMIN',
  'STATUS_CHANGED',
  'REFUNDED',
  'APPLICATION_EDITED',
  'APPLICATION_CREATED'
);

CREATE TYPE activity_actor_type AS ENUM ('admin', 'client');

CREATE TABLE application_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  action_type activity_action_type NOT NULL,
  actor_id uuid,
  actor_type activity_actor_type NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_application_activity_log_application_id ON application_activity_log(application_id);
CREATE INDEX idx_application_activity_log_created_at ON application_activity_log(application_id, created_at DESC);

ALTER TABLE application_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "application_activity_log_select_admin" ON application_activity_log
  FOR SELECT
  USING (is_admin());

-- Inserts are done server-side via service role / admin client; no client policy needed

ALTER TABLE applications ADD COLUMN IF NOT EXISTS amount_paid_cents integer DEFAULT NULL;

UPDATE applications
SET amount_paid_cents = ROUND((total_fee * 100)::numeric)::integer
WHERE is_paid = true AND amount_paid_cents IS NULL;

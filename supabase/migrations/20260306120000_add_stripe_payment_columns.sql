-- Add Stripe payment columns to applications
ALTER TABLE applications ADD COLUMN is_paid BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE applications ADD COLUMN stripe_checkout_session_id VARCHAR(255);
ALTER TABLE applications ADD COLUMN stripe_payment_intent_id VARCHAR(255);
ALTER TABLE applications ADD COLUMN amount_refunded_cents INTEGER NOT NULL DEFAULT 0;

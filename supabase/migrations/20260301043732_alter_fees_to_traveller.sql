ALTER TABLE travellers DROP COLUMN gov_fee;
ALTER TABLE travellers DROP COLUMN processing_fee;

ALTER TABLE travellers ADD COLUMN gov_fee DECIMAL(10, 2) NOT NULL;
ALTER TABLE travellers ADD COLUMN processing_fee DECIMAL(10, 2) NOT NULL;
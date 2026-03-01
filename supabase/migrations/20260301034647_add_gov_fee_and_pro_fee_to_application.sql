ALTER table applications ADD COLUMN gov_fee DECIMAL(10, 2) NOT NULL DEFAULT 0;
ALTER table applications ADD COLUMN processing_fee DECIMAL(10, 2) NOT NULL DEFAULT 0;

ALTER table applications DROP COLUMN price;
ALTER table products DROP COLUMN price;
ALTER table products ADD COLUMN processing_fee_override DECIMAL(10, 2);
ALTER table products ADD COLUMN gov_fee_override DECIMAL(10, 2);

ALTER table visa_types ADD COLUMN processing_fee DECIMAL(10, 2) NOT NULL DEFAULT 0;
ALTER table visa_types ADD COLUMN gov_fee DECIMAL(10, 2) NOT NULL DEFAULT 0;

ALTER table turnaround_times ADD COLUMN fee DECIMAL(10, 2) NOT NULL DEFAULT 0;
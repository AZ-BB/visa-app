ALTER table applications ADD COLUMN turnaround_fee DECIMAL(10, 2) NOT NULL DEFAULT 0;
ALTER table applications ADD COLUMN total_fee DECIMAL(10, 2) NOT NULL DEFAULT 0;

ALTER table applications DROP COLUMN turnaround_time_cost;
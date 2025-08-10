-- =====================================================
-- MIGRATE APPLIED_AT FROM DATE TO TIMESTAMP
-- =====================================================

-- This migration updates the applied_at column from DATE to TIMESTAMP
-- to preserve the exact time when applications were submitted

BEGIN;

-- First, add a temporary column with TIMESTAMP type
ALTER TABLE applications ADD COLUMN applied_at_temp TIMESTAMP;

-- Copy existing data, setting time to noon to avoid timezone issues
UPDATE applications 
SET applied_at_temp = applied_at + INTERVAL '12 hours'
WHERE applied_at IS NOT NULL;

-- Drop the old column
ALTER TABLE applications DROP COLUMN applied_at;

-- Rename the new column
ALTER TABLE applications RENAME COLUMN applied_at_temp TO applied_at;

-- Add comment
COMMENT ON COLUMN applications.applied_at IS 'Date and time when the application was submitted';

COMMIT;

BEGIN;
ALTER TABLE health.component ADD COLUMN IF NOT EXISTS encrypted_data JSONB;
UPDATE health.component SET encrypted_data = jsonb_build_object('migrationRequired', true) WHERE encrypted_data IS NULL;
ALTER TABLE health.component ALTER COLUMN encrypted_data SET NOT NULL;
-- After migrating existing plaintext values into encrypted_data through a controlled script,
-- remove plaintext columns only after backup and verification:
-- ALTER TABLE health.component DROP COLUMN endpoint, DROP COLUMN host_name, DROP COLUMN port,
-- DROP COLUMN instance_number, DROP COLUMN technology, DROP COLUMN version;
COMMIT;

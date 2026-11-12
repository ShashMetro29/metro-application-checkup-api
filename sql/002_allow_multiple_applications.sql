-- Allow more than one application per country, even when they reuse the same name or code.
-- These constraints were too restrictive for the product requirement and prevented creating multiple applications.
ALTER TABLE health.application DROP CONSTRAINT IF EXISTS uq_application_country_name;
ALTER TABLE health.application DROP CONSTRAINT IF EXISTS uq_application_country_code;

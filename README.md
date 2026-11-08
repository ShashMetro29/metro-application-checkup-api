# Automatic Health Check Node API

Standard layered Express backend for the existing PostgreSQL `health` schema.

## Structure
- `controllers`: HTTP input/output only
- `services`: business rules, encryption and country access orchestration
- `models`: parameterized PostgreSQL queries
- `middleware`: JWT authentication, permission authorization, validation and errors
- `utils`: Argon2id, JWT, AES-256-GCM, logging and common errors
- `validators`: Zod request schemas
- `routes`: endpoint mapping
- `sql`: schema migration required for encrypted component payloads
- `postman`: importable API collection

## Setup with your existing PostgreSQL
1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Generate secrets:
   - JWT: `openssl rand -base64 48`
   - Encryption: `openssl rand -base64 32`
3. Run `sql/001_component_encryption_migration.sql` once against your existing database.
4. Run `npm install`.
5. Create the initial superuser: `npm run create:admin -- admin@example.com 'StrongPassword123!' 'Administrator'`.
6. Start: `npm run dev`.
7. Import `postman/Automatic-Health-Check-MVC.postman_collection.json`.

## Security
Passwords are hashed with Argon2id, not reversibly encrypted. Component connection data is encrypted with AES-256-GCM. Prefer a `secretReference` to Azure Key Vault or HashiCorp Vault instead of storing actual database passwords.

## Endpoints
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/countries`
- `GET|POST /api/v1/applications`
- `POST /api/v1/environments`
- `GET|POST /api/v1/components`
- `GET /healthz`

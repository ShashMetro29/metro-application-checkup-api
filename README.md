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
- `PATCH|DELETE /api/v1/applications/:id`
- `POST|PATCH|DELETE /api/v1/environments/:id`
- `GET|POST|PATCH|DELETE /api/v1/components/:id`
- `GET /healthz`

## Multi-environment application registration
The application API supports creating an application with multiple environments and multiple components in each environment in one transaction.

Example request body:

```json
{
  "countryId": 1,
  "name": "Metro Billing",
  "code": "metro-billing",
  "description": "Billing platform",
  "ownerTeam": "Platform",
  "documentationUrl": "https://example.com/docs",
  "environments": [
    {
      "name": "PRODUCTION",
      "baseUrl": "https://billing.example.com",
      "components": [
        {
          "name": "API Gateway",
          "componentType": "APPLICATION_SERVER",
          "endpoint": "https://billing.example.com/health",
          "isCritical": true
        },
        {
          "name": "PostgreSQL",
          "componentType": "DATABASE",
          "hostName": "db.internal",
          "port": 5432,
          "technology": "POSTGRES",
          "version": "15"
        }
      ]
    },
    {
      "name": "PRE_PRODUCTION",
      "baseUrl": "https://billing-preprod.example.com",
      "components": [
        {
          "name": "Message Broker",
          "componentType": "INTERFACE",
          "hostName": "mq.internal",
          "port": 5672,
          "technology": "RABBITMQ",
          "version": "3.13"
        }
      ]
    }
  ]
}
```

The app details response includes environment and component health summaries with `health` payloads for each environment and component route.

## Step-by-step curl workflow

1. Login and save token:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "StrongPassword123!"
  }'
```

2. Create an application with multiple environments/components in one request:

```bash
curl -X POST http://localhost:3000/api/v1/applications \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "countryId": 1,
    "name": "Metro Billing",
    "code": "metro-billing",
    "description": "Billing platform",
    "ownerTeam": "Platform",
    "documentationUrl": "https://example.com/docs",
    "environments": [
      {
        "name": "PRODUCTION",
        "baseUrl": "https://billing.example.com",
        "components": [
          {"name": "API Gateway", "componentType": "APPLICATION_SERVER", "endpoint": "https://billing.example.com/health"},
          {"name": "PostgreSQL", "componentType": "DATABASE", "hostName": "db.internal", "port": 5432, "technology": "POSTGRES", "version": "15"}
        ]
      },
      {
        "name": "PRE_PRODUCTION",
        "baseUrl": "https://billing-preprod.example.com",
        "components": [
          {"name": "Message Broker", "componentType": "INTERFACE", "hostName": "mq.internal", "port": 5672, "technology": "RABBITMQ", "version": "3.13"}
        ]
      }
    ]
  }'
```

3. Create an additional environment later for the same application:

```bash
curl -X POST http://localhost:3000/api/v1/environments \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": 1,
    "name": "PRODUCTION",
    "baseUrl": "https://billing-api.example.com",
    "components": [
      {"name": "Redis Cache", "componentType": "INTERFACE", "hostName": "cache.internal", "port": 6379, "technology": "REDIS"}
    ]
  }'
```

4. Add a new component to an existing environment:

```bash
curl -X POST http://localhost:3000/api/v1/components \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "environmentId": 1,
    "name": "Payment API",
    "componentType": "APPLICATION_SERVER",
    "endpoint": "https://billing.example.com/payment/health"
  }'
```

5. Fetch health details for the application:

```bash
curl -X GET "http://localhost:3000/api/v1/applications/details?countryId=1" \
  -H "Authorization: Bearer <TOKEN>"
```

6. Update an application, environment, or component:

```bash
curl -X PATCH http://localhost:3000/api/v1/applications/1 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated billing platform",
    "documentationUrl": "https://example.com/billing-docs"
  }'

curl -X PATCH http://localhost:3000/api/v1/environments/1 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "baseUrl": "https://billing.example.com/v2",
    "enabled": true
  }'

curl -X PATCH http://localhost:3000/api/v1/components/1 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Gateway v2",
    "enabled": true,
    "isCritical": true
  }'
```

7. Soft delete an application, environment, or component:

```bash
curl -X DELETE http://localhost:3000/api/v1/components/1 \
  -H "Authorization: Bearer <TOKEN>"

curl -X DELETE http://localhost:3000/api/v1/environments/1 \
  -H "Authorization: Bearer <TOKEN>"

curl -X DELETE http://localhost:3000/api/v1/applications/1 \
  -H "Authorization: Bearer <TOKEN>"
```

## UI workflow design

1. Country selection
   - User selects a country from the country list.
   - The app loads all applications for that country.

2. Application register flow
   - Click `New Application`.
   - Enter application name, code, owner team, description, documentation URL.
   - Allow adding one or more environments before saving.
   - Each environment can have fields: name (`PRODUCTION` or `PRE_PRODUCTION`), base URL, enabled state.
   - Each environment can contain multiple components, such as Database, API, Message Broker, UI, SSL Certificate, and other monitorable endpoints.

3. Environment management
   - On the application detail page, show environment cards with health badges.
   - Provide `Add Environment` and `Edit Environment` actions.
   - Each environment card lists its components and their health status.

4. Component management
   - Add component uses a form with: name, type, endpoint or host/port, instance number, technology, version, critical flag, enabled flag.
   - Supported component types align with the schema: `UI`, `APPLICATION_SERVER`, `NODE_SERVER`, `DATABASE`, `INTERFACE`, `SSL_CERTIFICATE`, `INSTANCE`, `OTHER`.

5. Health checks
   - Every environment shows the URL health summary.
   - Every component shows either HTTP health or TCP health depending on configuration.
   - The backend returns `health` details in the app details payload so the UI can render green/red/yellow badges without additional calls.

6. Delete and edit flow
   - Use modal-based confirmation for delete actions.
   - `Edit` opens the same form with prefilled values so the user can patch an application, environment, or component in place.

This structure matches the relational schema in the application, environment, component, and monitoring configuration tables and supports the required multi-environment, multi-component registration model described in the requirement.

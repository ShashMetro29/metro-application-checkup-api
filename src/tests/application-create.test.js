import test from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { env } from '../config/env.js';
import { ApplicationController } from '../controllers/application.controller.js';

const { Pool } = pg;
const pool = new Pool({ connectionString: env.DATABASE_URL });

test('allows multiple applications in the same country with the same code', async () => {
  const countryId = 8;
  const name = `supplier portal ${Date.now()}`;
  const code = 'NL';

  const first = await pool.query(
    `INSERT INTO health.application (country_id, name, code, description, owner_team, documentation_url, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, 'test', 'team', 'https://example.com', true, NOW(), NOW())
     RETURNING id`,
    [countryId, name, code]
  );

  const secondName = `supplier portal 2 ${Date.now()}`;
  const second = await pool.query(
    `INSERT INTO health.application (country_id, name, code, description, owner_team, documentation_url, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, 'test', 'team', 'https://example.com', true, NOW(), NOW())
     RETURNING id`,
    [countryId, secondName, code]
  );

  assert.ok(first.rows[0].id);
  assert.ok(second.rows[0].id);

  await pool.query('DELETE FROM health.application WHERE id = ANY($1)', [[first.rows[0].id, second.rows[0].id]]);
});

test('creates application with nested environments and components', async () => {
  const payload = {
    countryId: 8,
    name: `supplier portal nested ${Date.now()}`,
    code: `NESTED-${Date.now()}`,
    description: 'NL',
    ownerTeam: 'Manisha',
    documentationUrl: 'https://xyz.com',
    environments: [{
      name: 'PRE_PRODUCTION',
      baseUrl: 'https://supplierportal.makro.nl/porta',
      enabled: true,
      components: [{
        name: 'SERVER',
        componentType: 'APPLICATION_SERVER',
        endpoint: 'https://supplierportal.makro.nl/porta',
        hostName: '10.4.3.4.4',
        port: 5432,
        technology: 'SAAS',
        version: '4.4',
        isCritical: true,
        enabled: true
      }]
    }]
  };

  let responseBody;
  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return body;
    }
  };

  await ApplicationController.create({ user: { id: 1, is_superuser: true }, validated: { body: payload } }, res);

  assert.equal(res.statusCode, 201);
  assert.ok(responseBody.id);

  const environments = await pool.query('SELECT id, application_id, name FROM health.environment WHERE application_id = $1', [responseBody.id]);
  assert.equal(environments.rows.length, 1);
  assert.equal(environments.rows[0].name, 'PRE_PRODUCTION');

  const components = await pool.query('SELECT id, environment_id, name FROM health.component WHERE environment_id = $1', [environments.rows[0].id]);
  assert.equal(components.rows.length, 1);
  assert.equal(components.rows[0].name, 'SERVER');

  await pool.query('DELETE FROM health.application WHERE id = $1', [responseBody.id]);
});

test.after(async () => {
  await pool.end();
});

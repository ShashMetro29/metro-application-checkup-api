import test from 'node:test';
import assert from 'node:assert/strict';

import { applicationSchema, environmentSchema, componentSchema } from '../validators/schemas.js';

test('applicationSchema accepts nested environments with components', () => {
  const payload = {
    body: {
      countryId: 10,
      name: 'Metro Billing',
      code: 'metro-billing',
      description: 'Core billing platform',
      ownerTeam: 'Platform',
      documentationUrl: 'https://example.com/docs',
      environments: [
        {
          name: 'PRODUCTION',
          baseUrl: 'https://billing.example.com',
          components: [
            {
              name: 'API Gateway',
              componentType: 'APPLICATION_SERVER',
              endpoint: 'https://billing.example.com/health',
              isCritical: true
            },
            {
              name: 'PostgreSQL',
              componentType: 'DATABASE',
              hostName: 'db.internal',
              port: 5432,
              technology: 'POSTGRES',
              version: '15'
            }
          ]
        }
      ]
    }
  };

  const result = applicationSchema.safeParse(payload);
  assert.equal(result.success, true, result.error ? result.error.message : '');
  assert.deepEqual(result.data.body.environments[0].components[0].componentType, 'APPLICATION_SERVER');
});

test('environmentSchema accepts nested components', () => {
  const payload = {
    body: {
      applicationId: 5,
      name: 'PRE_PRODUCTION',
      baseUrl: 'https://preprod.example.com',
      components: [
        {
          name: 'Message Broker',
          componentType: 'INTERFACE',
          hostName: 'mq.internal',
          port: 5672,
          technology: 'RABBITMQ',
          version: '3.13'
        }
      ]
    }
  };

  const result = environmentSchema.safeParse(payload);
  assert.equal(result.success, true, result.error ? result.error.message : '');
  assert.equal(result.data.body.components[0].componentType, 'INTERFACE');
});

test('componentSchema keeps accepted fields', () => {
  const payload = {
    body: {
      environmentId: 7,
      name: 'Payment Service',
      componentType: 'UI',
      endpoint: 'https://payment.example.com/health',
      isCritical: false,
      enabled: true
    }
  };

  const result = componentSchema.safeParse(payload);
  assert.equal(result.success, true, result.error ? result.error.message : '');
  assert.equal(result.data.body.isCritical, false);
});

test('PATCH schemas accept partial updates without requiring a full object', () => {
  const appResult = applicationSchema.safeParse({
    body: {
      countryId: 2,
      name: 'App',
      code: 'app',
      description: 'Updated app'
    }
  });
  assert.equal(appResult.success, true, appResult.error ? appResult.error.message : '');

  const componentResult = componentSchema.safeParse({
    body: {
      environmentId: 12,
      name: 'Monitoring Service',
      componentType: 'API',
      hostName: 'api.internal',
      port: 8080
    }
  });
  assert.equal(componentResult.success, true, componentResult.error ? componentResult.error.message : '');
  assert.equal(componentResult.data.body.componentType, 'APPLICATION_SERVER');
});

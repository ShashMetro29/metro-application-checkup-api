import { db } from '../config/database.js';

export const ComponentModel = {
  create: async b => (await db.query(
    `INSERT INTO health.component (
      environment_id,
      name,
      component_type,
      endpoint,
      host_name,
      port,
      instance_number,
      technology,
      version,
      is_critical,
      enabled,
      created_at,
      updated_at
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10,
      TRUE,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    ) RETURNING id, environment_id, name, component_type, endpoint, host_name, port, instance_number, technology, version, is_critical, enabled, created_at, updated_at`,
    [
      b.environmentId,
      b.name,
      b.componentType,
      b.endpoint || null,
      b.hostName || null,
      b.port ?? null,
      b.instanceNumber ?? null,
      b.technology || null,
      b.version || null,
      b.isCritical ?? true
    ]
  )).rows[0],

  list: async environmentId => (await db.query(
    `SELECT
      id,
      environment_id,
      name,
      component_type,
      endpoint,
      host_name,
      port,
      instance_number,
      technology,
      version,
      is_critical,
      enabled,
      created_at,
      updated_at
    FROM health.component
    WHERE environment_id = $1 AND deleted_at IS NULL
    ORDER BY name`,
    [environmentId]
  )).rows
};

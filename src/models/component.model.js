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
      $11,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    ) RETURNING id, environment_id, name, component_type, endpoint, host_name, port, instance_number, technology, version, is_critical, enabled, created_at, updated_at`,
    [
      b.environmentId ?? b.environment_id,
      b.name,
      b.componentType ?? b.component_type,
      b.endpoint || null,
      b.hostName ?? b.host_name ?? null,
      b.port ?? null,
      b.instanceNumber ?? b.instance_number ?? null,
      b.technology || null,
      b.version || null,
      b.isCritical ?? b.is_critical ?? true,
      b.enabled ?? true
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
  )).rows,

  findById: async id => (await db.query(
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
      updated_at,
      deleted_at
    FROM health.component
    WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  )).rows[0],

  update: async (id, b) => {
    const fields = [];
    const values = [];

    const push = (column, value) => {
      if (value !== undefined) {
        fields.push(`${column} = $${values.length + 1}`);
        values.push(value);
      }
    };

    push('name', b.name);
    push('component_type', b.componentType ?? b.component_type);
    push('endpoint', b.endpoint ?? null);
    push('host_name', b.hostName ?? b.host_name ?? null);
    push('port', b.port ?? null);
    push('instance_number', b.instanceNumber ?? b.instance_number ?? null);
    push('technology', b.technology ?? null);
    push('version', b.version ?? null);
    push('is_critical', b.isCritical ?? b.is_critical ?? undefined);
    push('enabled', b.enabled ?? undefined);

    if (!fields.length) {
      return ComponentModel.findById(id);
    }

    values.push(id);

    return (await db.query(
      `UPDATE health.component
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${values.length}
       RETURNING id, environment_id, name, component_type, endpoint, host_name, port, instance_number, technology, version, is_critical, enabled, created_at, updated_at`,
      values
    )).rows[0];
  },

  remove: async id => (await db.query(
    `UPDATE health.component
     SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING *`,
    [id]
  )).rows[0]
};

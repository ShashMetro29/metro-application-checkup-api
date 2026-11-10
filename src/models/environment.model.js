import { db } from '../config/database.js';

export const EnvironmentModel = {
  create: async b => {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const environmentResult = await client.query(
        'INSERT INTO health.environment(application_id, name, base_url, enabled) VALUES($1, $2, $3, $4) RETURNING *',
        [b.applicationId ?? b.application_id, b.name, b.baseUrl || b.base_url || null, b.enabled ?? true]
      );

      const environment = environmentResult.rows[0];
      const components = [];

      for (const component of b.components || []) {
        const componentResult = await client.query(
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
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *`,
          [
            environment.id,
            component.name,
            component.componentType ?? component.component_type,
            component.endpoint || null,
            component.hostName ?? component.host_name ?? null,
            component.port ?? null,
            component.instanceNumber ?? component.instance_number ?? null,
            component.technology || null,
            component.version || null,
            component.isCritical ?? component.is_critical ?? true,
            component.enabled ?? true
          ]
        );
        components.push(componentResult.rows[0]);
      }

      await client.query('COMMIT');
      return { ...environment, components };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  findById: async id => (await db.query(
    `SELECT
      e.id,
      e.application_id,
      e.name,
      e.base_url,
      e.enabled,
      e.created_at,
      e.updated_at,
      e.deleted_at,
      a.country_id
    FROM health.environment e
    JOIN health.application a ON a.id = e.application_id
    WHERE e.id = $1 AND e.deleted_at IS NULL`,
    [id]
  )).rows[0],

  countryId: async id => (await db.query('SELECT a.country_id FROM health.environment e JOIN health.application a ON a.id=e.application_id WHERE e.id=$1 AND e.deleted_at IS NULL',[id])).rows[0]?.country_id,

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
    push('base_url', b.baseUrl ?? b.base_url ?? undefined);
    push('enabled', b.enabled ?? undefined);

    if (!fields.length) {
      return EnvironmentModel.findById(id);
    }

    values.push(id);

    return (await db.query(
      `UPDATE health.environment
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${values.length} AND deleted_at IS NULL
       RETURNING *`,
      values
    )).rows[0];
  },

  remove: async id => (await db.query(
    `UPDATE health.environment
     SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING *`,
    [id]
  )).rows[0]
};

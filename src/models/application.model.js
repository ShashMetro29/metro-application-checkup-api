import { db } from '../config/database.js';
import { checkComponentHealth, checkUrlHealth } from '../utils/health.util.js';

const hydrateAppEnvironment = async environment => {
  const componentRows = environment.components || [];
  const components = await Promise.all(componentRows.map(async component => ({
    ...component,
    health: await checkComponentHealth(component)
  })));

  return {
    ...environment,
    health: await checkUrlHealth(environment.base_url),
    components
  };
};

export const ApplicationModel = {
  listByCountry: async countryId => (await db.query('SELECT * FROM health.application WHERE country_id=$1 AND deleted_at IS NULL ORDER BY name', [countryId])).rows,

  create: async b => (await db.query('INSERT INTO health.application(country_id,name,code,description,owner_team,documentation_url) VALUES($1,$2,$3,$4,$5,$6) RETURNING *', [b.countryId, b.name, b.code, b.description || null, b.ownerTeam || null, b.documentationUrl || null])).rows[0],

  findCountryId: async id => (await db.query('SELECT country_id FROM health.application WHERE id=$1 AND deleted_at IS NULL', [id])).rows[0]?.country_id,

  detailsByCountry: async countryId => {
    const applications = (await db.query(
      `SELECT
        id,
        country_id,
        name,
        code,
        description,
        owner_team,
        documentation_url,
        is_active,
        created_at,
        updated_at,
        deleted_at
      FROM health.application
      WHERE country_id = $1 AND deleted_at IS NULL
      ORDER BY name`,
      [countryId]
    )).rows;

    if (!applications.length) return [];

    const appIds = applications.map(app => app.id);
    const environments = (await db.query(
      `SELECT
        id,
        application_id,
        name,
        base_url,
        enabled,
        created_at,
        updated_at,
        deleted_at
      FROM health.environment
      WHERE application_id = ANY($1) AND deleted_at IS NULL
      ORDER BY name`,
      [appIds]
    )).rows;

    const envIds = environments.map(env => env.id);
    const components = envIds.length
      ? (await db.query(
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
          WHERE environment_id = ANY($1) AND deleted_at IS NULL
          ORDER BY name`,
          [envIds]
        )).rows
      : [];

    const componentsByEnv = components.reduce((acc, component) => {
      const key = Number(component.environment_id);
      if (!acc[key]) acc[key] = [];
      acc[key].push(component);
      return acc;
    }, {});

    const environmentsByApp = environments.reduce((acc, environment) => {
      const key = Number(environment.application_id);
      if (!acc[key]) acc[key] = [];
      acc[key].push({
        ...environment,
        components: componentsByEnv[Number(environment.id)] || []
      });
      return acc;
    }, {});

    const hydrated = await Promise.all(applications.map(async app => ({
      ...app,
      environments: await Promise.all((environmentsByApp[Number(app.id)] || []).map(async environment => hydrateAppEnvironment(environment)))
    })));

    return hydrated;
  },

  findById: async id => {
    const application = (await db.query(
      `SELECT
        id,
        country_id,
        name,
        code,
        description,
        owner_team,
        documentation_url,
        is_active,
        created_at,
        updated_at,
        deleted_at
      FROM health.application
      WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    )).rows[0];

    if (!application) return null;

    const environments = (await db.query(
      `SELECT
        id,
        application_id,
        name,
        base_url,
        enabled,
        created_at,
        updated_at,
        deleted_at
      FROM health.environment
      WHERE application_id = $1 AND deleted_at IS NULL
      ORDER BY name`,
      [id]
    )).rows;

    const envIds = environments.map(env => env.id);
    const components = envIds.length
      ? (await db.query(
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
          WHERE environment_id = ANY($1) AND deleted_at IS NULL
          ORDER BY name`,
          [envIds]
        )).rows
      : [];

    const componentsByEnv = components.reduce((acc, component) => {
      const key = Number(component.environment_id);
      if (!acc[key]) acc[key] = [];
      acc[key].push(component);
      return acc;
    }, {});

    return {
      ...application,
      environments: await Promise.all(environments.map(async environment => hydrateAppEnvironment({
        ...environment,
        components: componentsByEnv[Number(environment.id)] || []
      })))
    };
  }
};

import { db } from '../config/database.js';
export const EnvironmentModel={
 create: async b => (await db.query('INSERT INTO health.environment(application_id,name,base_url) VALUES($1,$2,$3) RETURNING *',[b.applicationId,b.name,b.baseUrl||null])).rows[0],
 countryId: async id => (await db.query('SELECT a.country_id FROM health.environment e JOIN health.application a ON a.id=e.application_id WHERE e.id=$1',[id])).rows[0]?.country_id
};

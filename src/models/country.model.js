import { db } from '../config/database.js';
export const CountryModel = {
  findById: async id => (await db.query('SELECT id, name, iso_code, is_active FROM health.country WHERE id = $1 AND deleted_at IS NULL', [id])).rows[0],
  all: async user => (await db.query(user.is_superuser ? 'SELECT * FROM health.country WHERE deleted_at IS NULL ORDER BY name' : 'SELECT c.* FROM health.country c JOIN health.user_country_access u ON u.country_id=c.id WHERE u.user_id=$1 AND c.deleted_at IS NULL ORDER BY c.name', user.is_superuser ? [] : [user.id])).rows
};

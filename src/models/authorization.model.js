import { db } from '../config/database.js';
export const AuthorizationModel={
 permissions: async (userId,codes) => (await db.query('SELECT DISTINCT p.code FROM health.permission p JOIN health.role_permission rp ON rp.permission_id=p.id JOIN health.user_role ur ON ur.role_id=rp.role_id WHERE ur.user_id=$1 AND p.code=ANY($2::text[])',[userId,codes])).rows,
 countryAccess: async (userId,countryId) => (await db.query('SELECT access_level FROM health.user_country_access WHERE user_id=$1 AND country_id=$2',[userId,countryId])).rows[0]
};

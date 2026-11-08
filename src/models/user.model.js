import { db } from '../config/database.js';

export const UserModel = {
  findByEmail: async email => (await db.query('SELECT * FROM health.app_user WHERE lower(email)=lower($1)', [email])).rows[0],

  findAuthById: async id => (await db.query('SELECT id,email,display_name,is_active,is_staff,is_superuser FROM health.app_user WHERE id=$1', [id])).rows[0],

  profile: async id => (await db.query('SELECT id,email,display_name,is_active,is_staff,is_superuser,date_joined,last_login FROM health.app_user WHERE id=$1', [id])).rows[0],

  create: async ({ email, password, displayName }) => (await db.query(
    `INSERT INTO health.app_user (
      email,
      password,
      display_name,
      is_active,
      is_staff,
      is_superuser,
      date_joined,
      created_at,
      updated_at
    ) VALUES (
      LOWER($1),
      $2,
      $3,
      TRUE,
      TRUE,
      TRUE,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    ) RETURNING id, email, display_name, is_active, is_staff, is_superuser, date_joined, last_login`,
    [email, password, displayName]
  )).rows[0],

  grantCountryAccess: async (userId, countryId, grantedBy = 1) => (await db.query(
    `INSERT INTO health.user_country_access (
      user_id,
      country_id,
      access_level,
      granted_at,
      granted_by
    ) VALUES ($1, $2, 'COUNTRY_ADMIN', CURRENT_TIMESTAMP, $3)
    ON CONFLICT (user_id, country_id) DO UPDATE SET
      access_level = EXCLUDED.access_level,
      granted_by = EXCLUDED.granted_by,
      granted_at = CURRENT_TIMESTAMP
    RETURNING user_id, country_id, access_level, granted_by`,
    [userId, countryId, grantedBy]
  )).rows[0],

  countryAccess: async userId => (await db.query(
    `SELECT
      uca.country_id AS id,
      c.name,
      uca.access_level
    FROM health.user_country_access uca
    JOIN health.country c ON c.id = uca.country_id
    WHERE uca.user_id = $1
      AND c.deleted_at IS NULL
    ORDER BY c.name ASC
    LIMIT 1`,
    [userId]
  )).rows[0]
};

import { UserModel } from '../models/user.model.js';
import { CountryModel } from '../models/country.model.js';
import { hashPassword, verifyPassword } from '../utils/password.util.js';
import { createAccessToken } from '../utils/jwt.util.js';
import { AppError } from '../utils/app-error.js';
import { transaction } from '../config/database.js';

export const AuthService = {
  signup: async ({ email, password, displayName, countryId, country_id }) => {
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedDisplayName = String(displayName || '').trim();
    const selectedCountryId = Number(countryId ?? country_id ?? 0);

    if (!normalizedEmail || !normalizedDisplayName) {
      throw new AppError(400, 'Email and display name are required', 'VALIDATION_ERROR');
    }

    if (!selectedCountryId || Number.isNaN(selectedCountryId)) {
      throw new AppError(400, 'countryId is required', 'VALIDATION_ERROR');
    }

    const existingUser = await UserModel.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new AppError(409, 'User already exists', 'USER_EXISTS');
    }

    const country = await CountryModel.findById(selectedCountryId);
    if (!country) {
      throw new AppError(404, 'Country not found', 'COUNTRY_NOT_FOUND');
    }

    const result = await transaction(async client => {
      const userInsert = await client.query(
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
        [normalizedEmail, await hashPassword(String(password)), normalizedDisplayName]
      );

      const user = userInsert.rows[0];

      await client.query(
        `INSERT INTO health.user_country_access (
          user_id,
          country_id,
          access_level,
          granted_at,
          granted_by
        ) VALUES ($1, $2, 'COUNTRY_ADMIN', CURRENT_TIMESTAMP, 1)
        ON CONFLICT (user_id, country_id) DO UPDATE SET
          access_level = EXCLUDED.access_level,
          granted_by = EXCLUDED.granted_by,
          granted_at = CURRENT_TIMESTAMP`,
        [user.id, selectedCountryId]
      );

      return user;
    });

    return {
      accessToken: createAccessToken(result),
      tokenType: 'Bearer',
      expiresIn: '15m',
      user: {
        id: result.id,
        email: result.email,
        displayName: result.display_name,
        isSuperuser: result.is_superuser,
        isStaff: result.is_staff,
        isActive: result.is_active
      },
      country: {
        id: country.id,
        name: country.name,
        accessLevel: 'COUNTRY_ADMIN'
      }
    };
  },

  login: async (email, password) => {
    const user = await UserModel.findByEmail(email);
    const storedHash = user?.password ?? user?.password_hash;

    if (!user || !user.is_active || !storedHash || !(await verifyPassword(storedHash, password))) {
      throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const country = await UserModel.countryAccess(user.id);

    return {
      accessToken: createAccessToken(user),
      tokenType: 'Bearer',
      expiresIn: '15m',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        isSuperuser: user.is_superuser
      },
      country: country ? { id: country.id, name: country.name, accessLevel: country.access_level } : null
    };
  }
};

import 'dotenv/config';
import { z } from 'zod';
const schema = z.object({
  NODE_ENV: z.enum(['development','test','production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ISSUER: z.string().default('automatic-health-check-api'),
  JWT_AUDIENCE: z.string().default('automatic-health-check-react'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  COMPONENT_ENCRYPTION_KEY: z.string().min(40),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.string().default('info')
});
export const env = schema.parse(process.env);

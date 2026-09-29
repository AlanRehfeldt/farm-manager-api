import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.url(),

  SERVER_PORT: z.coerce.number().optional().default(3000),

  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_ACCESS_COOKIE_NAME: z.string().default('fm_access_token'),
  JWT_REFRESH_COOKIE_NAME: z.string().default('fm_refresh_token'),
  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  /** Uma origem ou várias separadas por vírgula (app da fazenda e console). */
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:5173')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0),
    )
    .pipe(z.array(z.url()).min(1)),
});

export type Env = z.infer<typeof envSchema>;

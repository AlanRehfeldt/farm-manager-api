import { CookieOptions } from 'express';
import { Env } from 'src/env';

export function getBaseCookieOptions(
  env: Env,
): Pick<CookieOptions, 'httpOnly' | 'secure' | 'sameSite' | 'path'> {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: '/',
  };
}

export function getAccessCookieOptions(
  env: Env,
  maxAgeMs: number,
): CookieOptions {
  return {
    ...getBaseCookieOptions(env),
    maxAge: maxAgeMs,
  };
}

export function getRefreshCookieOptions(
  env: Env,
  maxAgeMs: number,
): CookieOptions {
  return {
    ...getBaseCookieOptions(env),
    maxAge: maxAgeMs,
  };
}

export function getClearCookieOptions(env: Env): CookieOptions {
  return getBaseCookieOptions(env);
}

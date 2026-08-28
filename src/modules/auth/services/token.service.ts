import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { Env } from 'src/env';
import {
  REFRESH_TOKEN_REPOSITORY,
  RefreshTokenRepository,
} from '../repositories/refresh-token.repository';
import { generateRefreshToken, hashToken } from '../utils/hash-token';
import {
  getAccessCookieOptions,
  getClearCookieOptions,
  getRefreshCookieOptions,
} from '../utils/cookie-options';
import {
  parseDurationToDate,
  parseDurationToMs,
} from '../utils/parse-duration';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env, true>,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async issueTokenPair(userId: string): Promise<TokenPair> {
    const refreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN', {
      infer: true,
    });

    const accessToken = await this.jwtService.signAsync({
      sub: userId,
    });

    const refreshToken = generateRefreshToken();
    const tokenHash = hashToken(refreshToken);

    await this.refreshTokenRepository.create({
      userId,
      tokenHash,
      expiresAt: parseDurationToDate(refreshExpiresIn),
    });

    return { accessToken, refreshToken };
  }

  private getEnv(): Env {
    return {
      DATABASE_URL: this.configService.get('DATABASE_URL', { infer: true }),
      SERVER_PORT: this.configService.get('SERVER_PORT', { infer: true }),
      JWT_SECRET: this.configService.get('JWT_SECRET', { infer: true }),
      JWT_ACCESS_EXPIRES_IN: this.configService.get('JWT_ACCESS_EXPIRES_IN', {
        infer: true,
      }),
      JWT_REFRESH_EXPIRES_IN: this.configService.get('JWT_REFRESH_EXPIRES_IN', {
        infer: true,
      }),
      JWT_ACCESS_COOKIE_NAME: this.configService.get('JWT_ACCESS_COOKIE_NAME', {
        infer: true,
      }),
      JWT_REFRESH_COOKIE_NAME: this.configService.get(
        'JWT_REFRESH_COOKIE_NAME',
        { infer: true },
      ),
      COOKIE_SECURE: this.configService.get('COOKIE_SECURE', { infer: true }),
      COOKIE_SAME_SITE: this.configService.get('COOKIE_SAME_SITE', {
        infer: true,
      }),
      CORS_ORIGIN: this.configService.get('CORS_ORIGIN', { infer: true }),
    };
  }

  setAuthCookies(res: Response, tokens: TokenPair): void {
    const env = this.getEnv();
    const accessExpiresIn = env.JWT_ACCESS_EXPIRES_IN;
    const refreshExpiresIn = env.JWT_REFRESH_EXPIRES_IN;

    res.cookie(
      env.JWT_ACCESS_COOKIE_NAME,
      tokens.accessToken,
      getAccessCookieOptions(env, parseDurationToMs(accessExpiresIn)),
    );

    res.cookie(
      env.JWT_REFRESH_COOKIE_NAME,
      tokens.refreshToken,
      getRefreshCookieOptions(env, parseDurationToMs(refreshExpiresIn)),
    );
  }

  clearAuthCookies(res: Response): void {
    const env = this.getEnv();
    const clearOptions = getClearCookieOptions(env);

    res.clearCookie(env.JWT_ACCESS_COOKIE_NAME, clearOptions);
    res.clearCookie(env.JWT_REFRESH_COOKIE_NAME, clearOptions);
  }

  getRefreshCookieName(): string {
    return this.configService.get('JWT_REFRESH_COOKIE_NAME', { infer: true });
  }
}

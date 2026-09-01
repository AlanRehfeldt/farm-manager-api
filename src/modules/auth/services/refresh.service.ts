import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  REFRESH_TOKEN_REPOSITORY,
  RefreshTokenRepository,
} from '../repositories/refresh-token.repository';
import { getCookie } from '../utils/get-cookie';
import { hashToken } from '../utils/hash-token';
import { TokenService } from './token.service';

@Injectable()
export class RefreshService {
  constructor(
    private readonly tokenService: TokenService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(req: Request, res: Response): Promise<{ message: string }> {
    const refreshCookieName = this.tokenService.getRefreshCookieName();
    const refreshToken = getCookie(req.cookies, refreshCookieName);

    if (!refreshToken) {
      this.tokenService.clearAuthCookies(res);
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = hashToken(refreshToken);
    const storedToken = await this.refreshTokenRepository.findByHash(tokenHash);

    if (!storedToken) {
      this.tokenService.clearAuthCookies(res);
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.revokedAt !== null) {
      await this.refreshTokenRepository.revokeAllByUserId(storedToken.userId);
      this.tokenService.clearAuthCookies(res);
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.expiresAt <= new Date()) {
      this.tokenService.clearAuthCookies(res);
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.refreshTokenRepository.revokeById(storedToken.id);

    const tokens = await this.tokenService.issueTokenPair(storedToken.userId);
    this.tokenService.setAuthCookies(res, tokens);

    return { message: 'Token refreshed' };
  }
}

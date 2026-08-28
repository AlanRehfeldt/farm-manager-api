import { Inject, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  REFRESH_TOKEN_REPOSITORY,
  RefreshTokenRepository,
} from '../repositories/refresh-token.repository';
import { getCookie } from '../utils/get-cookie';
import { hashToken } from '../utils/hash-token';
import { TokenService } from './token.service';

@Injectable()
export class LogoutService {
  constructor(
    private readonly tokenService: TokenService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(req: Request, res: Response): Promise<{ message: string }> {
    const refreshCookieName = this.tokenService.getRefreshCookieName();
    const refreshToken = getCookie(req.cookies, refreshCookieName);

    if (refreshToken) {
      await this.refreshTokenRepository.revokeByHash(hashToken(refreshToken));
    }

    this.tokenService.clearAuthCookies(res);

    return { message: 'Logged out' };
  }
}

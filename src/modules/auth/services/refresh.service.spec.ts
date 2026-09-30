jest.mock('./token.service', () => ({
  TokenService: class TokenService {},
}));

import { UnauthorizedException } from '@nestjs/common';
import {
  OrganizationSelection,
  OrganizationStatus,
  PlatformRole,
} from '@prisma/client';
import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { RefreshService } from './refresh.service';
import { TokenService } from './token.service';

describe('RefreshService', () => {
  let service: RefreshService;
  let refreshTokenRepository: jest.Mocked<
    Pick<
      RefreshTokenRepository,
      'findByHash' | 'revokeById' | 'revokeAllByUserId'
    >
  >;
  let userRepository: jest.Mocked<Pick<UserRepository, 'findSessionById'>>;
  let tokenService: jest.Mocked<
    Pick<
      TokenService,
      | 'getRefreshCookieName'
      | 'clearAuthCookies'
      | 'issueTokenPair'
      | 'setAuthCookies'
    >
  >;

  const res = {} as Parameters<RefreshService['execute']>[1];

  beforeEach(() => {
    refreshTokenRepository = {
      findByHash: jest.fn(),
      revokeById: jest.fn(),
      revokeAllByUserId: jest.fn(),
    };

    userRepository = {
      findSessionById: jest.fn().mockResolvedValue({
        id: 'user-1',
        platformRole: PlatformRole.NONE,
        memberships: [],
      }),
    };

    tokenService = {
      getRefreshCookieName: jest.fn().mockReturnValue('fm_refresh_token'),
      clearAuthCookies: jest.fn(),
      issueTokenPair: jest.fn().mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
      }),
      setAuthCookies: jest.fn(),
    };

    service = new RefreshService(
      tokenService as unknown as TokenService,
      refreshTokenRepository as unknown as RefreshTokenRepository,
      userRepository as unknown as UserRepository,
    );
  });

  it('revokes all refresh tokens when a revoked token is reused', async () => {
    refreshTokenRepository.findByHash.mockResolvedValue({
      id: 'token-1',
      userId: 'user-1',
      revokedAt: new Date('2026-01-01T00:00:00.000Z'),
      expiresAt: new Date('2026-12-31T00:00:00.000Z'),
      organizationId: null,
      organizationSelection: OrganizationSelection.EXEMPT,
    });

    const req = {
      cookies: { fm_refresh_token: 'reused-token' },
    } as unknown as Parameters<RefreshService['execute']>[0];

    await expect(service.execute(req, res)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(refreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith(
      'user-1',
    );
    expect(tokenService.clearAuthCookies).toHaveBeenCalledWith(res);
    expect(refreshTokenRepository.revokeById).not.toHaveBeenCalled();
    expect(tokenService.issueTokenPair).not.toHaveBeenCalled();
  });

  it('clears cookies and rejects refresh when the tenant session is suspended', async () => {
    refreshTokenRepository.findByHash.mockResolvedValue({
      id: 'token-1',
      userId: 'user-1',
      revokedAt: null,
      expiresAt: new Date('2026-12-31T00:00:00.000Z'),
      organizationId: null,
      organizationSelection: OrganizationSelection.EXEMPT,
    });
    userRepository.findSessionById.mockResolvedValue({
      id: 'user-1',
      platformRole: PlatformRole.NONE,
      memberships: [{ organization: { status: OrganizationStatus.SUSPENDED } }],
    } as never);

    const req = {
      cookies: { fm_refresh_token: 'live-token' },
    } as unknown as Parameters<RefreshService['execute']>[0];

    await expect(service.execute(req, res)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(tokenService.clearAuthCookies).toHaveBeenCalledWith(res);
    expect(tokenService.issueTokenPair).not.toHaveBeenCalled();
  });

  it('reissues the access token with the organization bound to the refresh token', async () => {
    refreshTokenRepository.findByHash.mockResolvedValue({
      id: 'token-1',
      userId: 'user-1',
      revokedAt: null,
      expiresAt: new Date('2026-12-31T00:00:00.000Z'),
      organizationId: 'org-1',
      organizationSelection: OrganizationSelection.BOUND,
    });
    userRepository.findSessionById.mockResolvedValue({
      id: 'user-1',
      platformRole: PlatformRole.NONE,
      memberships: [
        {
          organizationId: 'org-1',
          organization: { status: OrganizationStatus.ACTIVE },
        },
      ],
    } as never);

    const req = {
      cookies: { fm_refresh_token: 'live-token' },
    } as unknown as Parameters<RefreshService['execute']>[0];

    await service.execute(req, res);

    expect(tokenService.issueTokenPair).toHaveBeenCalledWith('user-1', {
      organizationSelection: OrganizationSelection.BOUND,
      organizationId: 'org-1',
    });
  });

  it('rejects refresh when the bound organization is no longer active', async () => {
    refreshTokenRepository.findByHash.mockResolvedValue({
      id: 'token-1',
      userId: 'user-1',
      revokedAt: null,
      expiresAt: new Date('2026-12-31T00:00:00.000Z'),
      organizationId: 'org-1',
      organizationSelection: OrganizationSelection.BOUND,
    });
    userRepository.findSessionById.mockResolvedValue({
      id: 'user-1',
      platformRole: PlatformRole.NONE,
      memberships: [
        {
          organizationId: 'org-2',
          organization: { status: OrganizationStatus.ACTIVE },
        },
      ],
    } as never);

    const req = {
      cookies: { fm_refresh_token: 'live-token' },
    } as unknown as Parameters<RefreshService['execute']>[0];

    await expect(service.execute(req, res)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(tokenService.clearAuthCookies).toHaveBeenCalledWith(res);
    expect(tokenService.issueTokenPair).not.toHaveBeenCalled();
  });

  it('rejects an exempt refresh after the tenant gains a membership', async () => {
    refreshTokenRepository.findByHash.mockResolvedValue({
      id: 'token-1',
      userId: 'user-1',
      revokedAt: null,
      expiresAt: new Date('2026-12-31T00:00:00.000Z'),
      organizationId: null,
      organizationSelection: OrganizationSelection.EXEMPT,
    });
    userRepository.findSessionById.mockResolvedValue({
      id: 'user-1',
      platformRole: PlatformRole.NONE,
      memberships: [
        {
          organizationId: 'org-1',
          organization: { status: OrganizationStatus.ACTIVE },
        },
      ],
    } as never);

    const req = {
      cookies: { fm_refresh_token: 'live-token' },
    } as unknown as Parameters<RefreshService['execute']>[0];

    await expect(service.execute(req, res)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(tokenService.clearAuthCookies).toHaveBeenCalledWith(res);
    expect(tokenService.issueTokenPair).not.toHaveBeenCalled();
    expect(refreshTokenRepository.revokeById).not.toHaveBeenCalled();
  });

  it('reissues an exempt refresh for platform support without membership', async () => {
    refreshTokenRepository.findByHash.mockResolvedValue({
      id: 'token-1',
      userId: 'user-1',
      revokedAt: null,
      expiresAt: new Date('2026-12-31T00:00:00.000Z'),
      organizationId: null,
      organizationSelection: OrganizationSelection.EXEMPT,
    });
    userRepository.findSessionById.mockResolvedValue({
      id: 'user-1',
      platformRole: PlatformRole.PLATFORM_SUPPORT,
      memberships: [],
    } as never);

    const req = {
      cookies: { fm_refresh_token: 'live-token' },
    } as unknown as Parameters<RefreshService['execute']>[0];

    await service.execute(req, res);

    expect(tokenService.issueTokenPair).toHaveBeenCalledWith('user-1', {
      organizationSelection: OrganizationSelection.EXEMPT,
      organizationId: null,
    });
    expect(tokenService.clearAuthCookies).not.toHaveBeenCalled();
  });
});

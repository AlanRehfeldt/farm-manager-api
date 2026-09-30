import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/env';
import {
  OrganizationSelection,
  OrganizationStatus,
  PlatformRole,
} from '@prisma/client';
import { UserRepository } from 'src/modules/user/repositories/user.repository';

jest.mock('@nestjs/passport', () => ({
  PassportStrategy: () =>
    class MockPassportStrategy {
      constructor() {}
    },
}));

jest.mock('passport-jwt', () => ({
  ExtractJwt: {
    fromExtractors: () => () => null,
  },
  Strategy: class MockJwtStrategy {},
}));

import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const userRepository: jest.Mocked<Pick<UserRepository, 'findSessionById'>> = {
    findSessionById: jest.fn(),
  };

  const configService = {
    get: (key: string) => {
      if (key === 'JWT_ACCESS_COOKIE_NAME') {
        return 'fm_access_token';
      }
      if (key === 'JWT_SECRET') {
        return 'test-secret';
      }
      return undefined;
    },
  } as unknown as ConfigService<Env, true>;

  const strategy = new JwtStrategy(
    configService,
    userRepository as unknown as UserRepository,
  );

  const passwordChangedAt = new Date('2026-09-28T12:00:00.000Z');

  beforeEach(() => {
    userRepository.findSessionById.mockResolvedValue({
      id: 'user-1',
      passwordChangedAt,
      mustChangePassword: false,
      platformRole: PlatformRole.NONE,
      memberships: [],
    } as never);
  });

  it('rejects an access token that has no passwordChangedAt claim', async () => {
    await expect(strategy.validate({ sub: 'user-1' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects a claim issued before the current password change', async () => {
    await expect(
      strategy.validate({
        sub: 'user-1',
        passwordChangedAt: passwordChangedAt.getTime() - 1,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('accepts a claim equal to the current password change', async () => {
    await expect(
      strategy.validate({
        sub: 'user-1',
        passwordChangedAt: passwordChangedAt.getTime(),
        organizationSelection: OrganizationSelection.EXEMPT,
      }),
    ).resolves.toEqual({
      userId: 'user-1',
      mustChangePassword: false,
      platformRole: PlatformRole.NONE,
      organizationSelection: OrganizationSelection.EXEMPT,
      organizationId: null,
    });
  });

  it('rejects an access token that has no organization selection', async () => {
    await expect(
      strategy.validate({
        sub: 'user-1',
        passwordChangedAt: passwordChangedAt.getTime(),
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('accepts a platform admin even when every membership org is suspended', async () => {
    userRepository.findSessionById.mockResolvedValue({
      id: 'user-1',
      passwordChangedAt,
      mustChangePassword: false,
      platformRole: PlatformRole.PLATFORM_ADMIN,
      memberships: [{ organization: { status: OrganizationStatus.SUSPENDED } }],
    } as never);

    await expect(
      strategy.validate({
        sub: 'user-1',
        passwordChangedAt: passwordChangedAt.getTime(),
        organizationSelection: OrganizationSelection.EXEMPT,
      }),
    ).resolves.toEqual({
      userId: 'user-1',
      mustChangePassword: false,
      platformRole: PlatformRole.PLATFORM_ADMIN,
      organizationSelection: OrganizationSelection.EXEMPT,
      organizationId: null,
    });
  });

  it('rejects a member whose organizations are all suspended', async () => {
    userRepository.findSessionById.mockResolvedValue({
      id: 'user-1',
      passwordChangedAt,
      mustChangePassword: false,
      platformRole: PlatformRole.NONE,
      memberships: [{ organization: { status: OrganizationStatus.SUSPENDED } }],
    } as never);

    await expect(
      strategy.validate({
        sub: 'user-1',
        passwordChangedAt: passwordChangedAt.getTime(),
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('accepts a member who still has an active organization', async () => {
    userRepository.findSessionById.mockResolvedValue({
      id: 'user-1',
      passwordChangedAt,
      mustChangePassword: false,
      platformRole: PlatformRole.NONE,
      memberships: [
        {
          organizationId: 'org-suspended',
          organization: { status: OrganizationStatus.SUSPENDED },
        },
        {
          organizationId: 'org-active',
          organization: { status: OrganizationStatus.ACTIVE },
        },
      ],
    } as never);

    await expect(
      strategy.validate({
        sub: 'user-1',
        passwordChangedAt: passwordChangedAt.getTime(),
        organizationSelection: OrganizationSelection.BOUND,
        organizationId: 'org-active',
      }),
    ).resolves.toEqual({
      userId: 'user-1',
      mustChangePassword: false,
      platformRole: PlatformRole.NONE,
      organizationSelection: OrganizationSelection.BOUND,
      organizationId: 'org-active',
    });
  });

  it('rejects a bound session whose organization is no longer active', async () => {
    userRepository.findSessionById.mockResolvedValue({
      id: 'user-1',
      passwordChangedAt,
      mustChangePassword: false,
      platformRole: PlatformRole.NONE,
      memberships: [
        {
          organizationId: 'org-suspended',
          organization: { status: OrganizationStatus.SUSPENDED },
        },
        {
          organizationId: 'org-active',
          organization: { status: OrganizationStatus.ACTIVE },
        },
      ],
    } as never);

    await expect(
      strategy.validate({
        sub: 'user-1',
        passwordChangedAt: passwordChangedAt.getTime(),
        organizationSelection: OrganizationSelection.BOUND,
        organizationId: 'org-suspended',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects an exempt tenant access token after a membership is added', async () => {
    userRepository.findSessionById.mockResolvedValue({
      id: 'user-1',
      passwordChangedAt,
      mustChangePassword: false,
      platformRole: PlatformRole.NONE,
      memberships: [
        {
          organizationId: 'org-active',
          organization: { status: OrganizationStatus.ACTIVE },
        },
      ],
    } as never);

    await expect(
      strategy.validate({
        sub: 'user-1',
        passwordChangedAt: passwordChangedAt.getTime(),
        organizationSelection: OrganizationSelection.EXEMPT,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('accepts an exempt platform support session without membership', async () => {
    userRepository.findSessionById.mockResolvedValue({
      id: 'user-1',
      passwordChangedAt,
      mustChangePassword: false,
      platformRole: PlatformRole.PLATFORM_SUPPORT,
      memberships: [],
    } as never);

    await expect(
      strategy.validate({
        sub: 'user-1',
        passwordChangedAt: passwordChangedAt.getTime(),
        organizationSelection: OrganizationSelection.EXEMPT,
      }),
    ).resolves.toEqual({
      userId: 'user-1',
      mustChangePassword: false,
      platformRole: PlatformRole.PLATFORM_SUPPORT,
      organizationSelection: OrganizationSelection.EXEMPT,
      organizationId: null,
    });
  });
});

jest.mock('./token.service', () => ({
  TokenService: class TokenService {},
}));

import {
  OrganizationSelection,
  OrganizationStatus,
  PlatformRole,
} from '@prisma/client';
import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { LoginService } from './login.service';
import { TokenService } from './token.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
}));

describe('LoginService', () => {
  const userRepository: jest.Mocked<
    Pick<UserRepository, 'findSessionByEmail'>
  > = {
    findSessionByEmail: jest.fn(),
  };
  const tokenService = {
    issueTokenPair: jest.fn().mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
    }),
    setAuthCookies: jest.fn(),
  };
  const res = {} as Parameters<LoginService['execute']>[2];

  const service = new LoginService(
    userRepository as unknown as UserRepository,
    tokenService as unknown as TokenService,
  );

  function session(
    memberships: Array<{ organizationId: string; status: OrganizationStatus }>,
  ) {
    return {
      id: 'user-1',
      name: 'Ana',
      email: 'ana@example.com',
      password: 'hashed',
      platformRole: PlatformRole.NONE,
      mustChangePassword: false,
      passwordChangedAt: new Date(),
      employeeId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      memberships: memberships.map((membership) => ({
        organizationId: membership.organizationId,
        organization: { status: membership.status },
      })),
    };
  }

  beforeEach(() => {
    tokenService.issueTokenPair.mockClear();
  });

  it('binds a tenant who belongs to one active organization', async () => {
    userRepository.findSessionByEmail.mockResolvedValue(
      session([
        { organizationId: 'org-1', status: OrganizationStatus.ACTIVE },
      ]) as never,
    );

    await service.execute('ana@example.com', 'secret', res);

    expect(tokenService.issueTokenPair).toHaveBeenCalledWith('user-1', {
      organizationSelection: OrganizationSelection.BOUND,
      organizationId: 'org-1',
    });
  });

  it('leaves the session pending when the tenant belongs to two organizations', async () => {
    userRepository.findSessionByEmail.mockResolvedValue(
      session([
        { organizationId: 'org-1', status: OrganizationStatus.ACTIVE },
        { organizationId: 'org-2', status: OrganizationStatus.ACTIVE },
      ]) as never,
    );

    await service.execute('ana@example.com', 'secret', res);

    expect(tokenService.issueTokenPair).toHaveBeenCalledWith('user-1', {
      organizationSelection: OrganizationSelection.PENDING,
      organizationId: null,
    });
  });

  it('keeps a platform admin exempt', async () => {
    userRepository.findSessionByEmail.mockResolvedValue({
      ...session([]),
      platformRole: PlatformRole.PLATFORM_ADMIN,
    } as never);

    await service.execute('ana@example.com', 'secret', res);

    expect(tokenService.issueTokenPair).toHaveBeenCalledWith('user-1', {
      organizationSelection: OrganizationSelection.EXEMPT,
      organizationId: null,
    });
  });
});

jest.mock('./token.service', () => ({
  TokenService: class TokenService {},
}));

import { ForbiddenException } from '@nestjs/common';
import {
  OrganizationSelection,
  OrganizationStatus,
  PlatformRole,
} from '@prisma/client';
import { OrganizationRepository } from 'src/modules/organization/repositories/organization.repository';
import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { AuthenticatedUser } from '../decorators/current-user.decorator';
import { FORBIDDEN_ORGANIZATION_CODE } from 'src/common/tenancy/forbidden-organization';
import { SelectOrganizationService } from './select-organization.service';
import { TokenService } from './token.service';

describe('SelectOrganizationService', () => {
  const userRepository: jest.Mocked<Pick<UserRepository, 'findSessionById'>> = {
    findSessionById: jest.fn(),
  };
  const tokenService = {
    revokeAndIssue: jest.fn().mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
    }),
    setAuthCookies: jest.fn(),
  };
  const organizationRepository: jest.Mocked<
    Pick<OrganizationRepository, 'touchLastAccessAt'>
  > = {
    touchLastAccessAt: jest.fn(),
  };
  const res = {} as Parameters<SelectOrganizationService['execute']>[2];
  const service = new SelectOrganizationService(
    userRepository as unknown as UserRepository,
    organizationRepository as unknown as OrganizationRepository,
    tokenService as unknown as TokenService,
  );

  const pendingUser: AuthenticatedUser = {
    userId: 'user-1',
    mustChangePassword: false,
    platformRole: PlatformRole.NONE,
    organizationSelection: OrganizationSelection.PENDING,
    organizationId: null,
  };

  beforeEach(() => {
    tokenService.revokeAndIssue.mockClear();
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
  });

  it('binds a pending session to the chosen organization', async () => {
    await service.execute(pendingUser, 'org-1', res);

    expect(tokenService.revokeAndIssue).toHaveBeenCalledWith('user-1', {
      organizationSelection: OrganizationSelection.BOUND,
      organizationId: 'org-1',
    });
    expect(tokenService.setAuthCookies).toHaveBeenCalled();
    expect(organizationRepository.touchLastAccessAt).toHaveBeenCalledWith(
      'org-1',
      expect.any(Date),
      0,
    );
  });

  it('rejects a session that is already bound', async () => {
    await expect(
      service.execute(
        {
          ...pendingUser,
          organizationSelection: OrganizationSelection.BOUND,
          organizationId: 'org-1',
        },
        'org-2',
        res,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(tokenService.revokeAndIssue).not.toHaveBeenCalled();
  });

  it('rejects an organization the user does not belong to', async () => {
    await expect(
      service.execute(pendingUser, 'org-2', res),
    ).rejects.toMatchObject({
      response: { code: FORBIDDEN_ORGANIZATION_CODE },
    });
  });
});

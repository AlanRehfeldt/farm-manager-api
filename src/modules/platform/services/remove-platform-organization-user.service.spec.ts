import { ConflictException, NotFoundException } from '@nestjs/common';
import { PlatformRole, Role } from '@prisma/client';
import { MembershipRepository } from 'src/modules/membership/repositories/membership.repository';
import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { PlatformRepository } from '../repositories/platform.repository';
import { RemovePlatformOrganizationUserService } from './remove-platform-organization-user.service';

describe('RemovePlatformOrganizationUserService', () => {
  const platformRepository: jest.Mocked<
    Pick<PlatformRepository, 'removeOrganizationMember'>
  > = {
    removeOrganizationMember: jest.fn(),
  };
  const userRepository: jest.Mocked<Pick<UserRepository, 'findById'>> = {
    findById: jest.fn(),
  };
  const membershipRepository: jest.Mocked<
    Pick<MembershipRepository, 'findManyByUserAndOrg' | 'countOrgAdmins'>
  > = {
    findManyByUserAndOrg: jest.fn(),
    countOrgAdmins: jest.fn(),
  };

  const service = new RemovePlatformOrganizationUserService(
    platformRepository as unknown as PlatformRepository,
    userRepository as unknown as UserRepository,
    membershipRepository as unknown as MembershipRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('removes a non-admin membership and revokes that organization session', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      platformRole: PlatformRole.NONE,
    } as never);
    membershipRepository.findManyByUserAndOrg.mockResolvedValue([
      { role: Role.USER, farmId: 'farm-1' },
    ] as never);

    await service.execute('actor-1', 'org-1', 'user-1');

    expect(platformRepository.removeOrganizationMember).toHaveBeenCalledWith({
      actorUserId: 'actor-1',
      organizationId: 'org-1',
      userId: 'user-1',
      guardLastOrgAdmin: false,
    });
  });

  it('refuses to remove the last organization admin', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      platformRole: PlatformRole.NONE,
    } as never);
    membershipRepository.findManyByUserAndOrg.mockResolvedValue([
      { role: Role.ADMIN, farmId: null },
    ] as never);
    membershipRepository.countOrgAdmins.mockResolvedValue(1);

    await expect(
      service.execute('actor-1', 'org-1', 'user-1'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(platformRepository.removeOrganizationMember).not.toHaveBeenCalled();
  });

  it('does not remove a platform support user through this door', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'support-1',
      platformRole: PlatformRole.PLATFORM_SUPPORT,
    } as never);

    await expect(
      service.execute('actor-1', 'org-1', 'support-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(membershipRepository.findManyByUserAndOrg).not.toHaveBeenCalled();
  });
});

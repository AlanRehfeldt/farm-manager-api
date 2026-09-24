import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Membership, PlatformRole, Role, User } from '@prisma/client';
import { MembershipRepository } from '../repositories/membership.repository';
import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { DeleteOrgUserService } from './delete-org-user.service';

describe('DeleteOrgUserService', () => {
  let service: DeleteOrgUserService;
  let membershipRepository: jest.Mocked<
    Pick<
      MembershipRepository,
      | 'findOrgAdmin'
      | 'findManyByUserAndOrg'
      | 'countOrgAdmins'
      | 'deleteManyByUserAndOrg'
    >
  >;
  let userRepository: jest.Mocked<Pick<UserRepository, 'findById'>>;

  const actorId = 'admin-1';
  const targetId = 'user-2';
  const organizationId = 'org-1';

  const targetUser = {
    id: targetId,
    platformRole: PlatformRole.NONE,
  } as User;

  const targetMembership = {
    id: 'm-1',
    userId: targetId,
    organizationId,
    farmId: null,
    role: Role.USER,
  } as Membership;

  beforeEach(() => {
    membershipRepository = {
      findOrgAdmin: jest.fn(),
      findManyByUserAndOrg: jest.fn(),
      countOrgAdmins: jest.fn(),
      deleteManyByUserAndOrg: jest.fn(),
    };
    userRepository = {
      findById: jest.fn(),
    };

    service = new DeleteOrgUserService(
      membershipRepository as unknown as MembershipRepository,
      userRepository as unknown as UserRepository,
    );
  });

  it('rejects self-removal even when other admins exist', async () => {
    membershipRepository.findOrgAdmin.mockResolvedValue({
      id: 'm-admin',
    } as Membership);
    userRepository.findById.mockResolvedValue({
      id: actorId,
      platformRole: PlatformRole.NONE,
    } as User);
    membershipRepository.findManyByUserAndOrg.mockResolvedValue([
      {
        id: 'm-self',
        userId: actorId,
        organizationId,
        farmId: null,
        role: Role.ADMIN,
      } as Membership,
    ]);
    membershipRepository.countOrgAdmins.mockResolvedValue(2);

    await expect(
      service.execute(actorId, actorId, organizationId),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(membershipRepository.deleteManyByUserAndOrg).not.toHaveBeenCalled();
  });

  it('removes another user from the organization', async () => {
    membershipRepository.findOrgAdmin.mockResolvedValue({
      id: 'm-admin',
    } as Membership);
    userRepository.findById.mockResolvedValue(targetUser);
    membershipRepository.findManyByUserAndOrg.mockResolvedValue([
      targetMembership,
    ]);

    await service.execute(actorId, targetId, organizationId);

    expect(membershipRepository.deleteManyByUserAndOrg).toHaveBeenCalledWith(
      targetId,
      organizationId,
    );
  });

  it('rejects when the target user is not in the organization', async () => {
    membershipRepository.findOrgAdmin.mockResolvedValue({
      id: 'm-admin',
    } as Membership);
    userRepository.findById.mockResolvedValue(targetUser);
    membershipRepository.findManyByUserAndOrg.mockResolvedValue([]);

    await expect(
      service.execute(actorId, targetId, organizationId),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(membershipRepository.deleteManyByUserAndOrg).not.toHaveBeenCalled();
  });
});

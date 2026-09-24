import { ConflictException, ForbiddenException } from '@nestjs/common';
import { Membership, PlatformRole, Role, User } from '@prisma/client';
import { FarmRepository } from 'src/modules/farm/repositories/farm.repository';
import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { MembershipRepository } from '../repositories/membership.repository';
import { UpdateOrgUserService } from './update-org-user.service';

describe('UpdateOrgUserService', () => {
  let service: UpdateOrgUserService;
  let membershipRepository: jest.Mocked<
    Pick<
      MembershipRepository,
      | 'findOrgAdmin'
      | 'findManyByUserAndOrg'
      | 'countOrgAdmins'
      | 'replaceProfileAndMemberships'
    >
  >;
  let farmRepository: jest.Mocked<Pick<FarmRepository, 'findById'>>;
  let userRepository: jest.Mocked<
    Pick<UserRepository, 'findById' | 'findByEmail'>
  >;

  const actorId = 'admin-1';
  const userId = 'user-2';
  const organizationId = 'org-1';
  const farmId = 'farm-1';

  const user = {
    id: userId,
    name: 'Operator',
    email: 'op@example.com',
    platformRole: PlatformRole.NONE,
  } as User;

  const existingMembership = {
    id: 'm-1',
    userId,
    organizationId,
    farmId,
    role: Role.USER,
  } as Membership;

  beforeEach(() => {
    membershipRepository = {
      findOrgAdmin: jest.fn(),
      findManyByUserAndOrg: jest.fn(),
      countOrgAdmins: jest.fn(),
      replaceProfileAndMemberships: jest.fn(),
    };
    farmRepository = {
      findById: jest.fn(),
    };
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
    };

    service = new UpdateOrgUserService(
      membershipRepository as unknown as MembershipRepository,
      farmRepository as unknown as FarmRepository,
      userRepository as unknown as UserRepository,
    );

    membershipRepository.findOrgAdmin.mockResolvedValue({
      id: 'm-admin',
    } as Membership);
    userRepository.findById.mockResolvedValue(user);
    membershipRepository.findManyByUserAndOrg.mockResolvedValue([
      existingMembership,
    ]);
    farmRepository.findById.mockResolvedValue({
      id: farmId,
      organizationId,
    } as never);
    userRepository.findByEmail.mockResolvedValue(null);
    membershipRepository.replaceProfileAndMemberships.mockResolvedValue([
      existingMembership,
    ]);
  });

  it('updates profile and memberships in a single repository call', async () => {
    const result = await service.execute(actorId, userId, {
      organizationId,
      name: 'Updated Name',
      email: 'updated@example.com',
      role: Role.USER,
      farmIds: [farmId],
    });

    expect(
      membershipRepository.replaceProfileAndMemberships,
    ).toHaveBeenCalledWith({
      userId,
      name: 'Updated Name',
      email: 'updated@example.com',
      organizationId,
      memberships: [
        {
          userId,
          organizationId,
          farmId,
          role: Role.USER,
        },
      ],
    });
    expect(result.memberships).toEqual([existingMembership]);
  });

  it('rejects when the actor is not an organization admin', async () => {
    membershipRepository.findOrgAdmin.mockResolvedValue(null);

    await expect(
      service.execute(actorId, userId, {
        organizationId,
        name: 'Updated Name',
        email: 'updated@example.com',
        role: Role.USER,
        farmIds: [farmId],
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(
      membershipRepository.replaceProfileAndMemberships,
    ).not.toHaveBeenCalled();
  });

  it('rejects demoting the last organization admin', async () => {
    membershipRepository.findManyByUserAndOrg.mockResolvedValue([
      {
        id: 'm-admin-target',
        userId,
        organizationId,
        farmId: null,
        role: Role.ADMIN,
      } as Membership,
    ]);
    membershipRepository.countOrgAdmins.mockResolvedValue(1);

    await expect(
      service.execute(actorId, userId, {
        organizationId,
        name: 'Updated Name',
        email: 'op@example.com',
        role: Role.USER,
        farmIds: [farmId],
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(
      membershipRepository.replaceProfileAndMemberships,
    ).not.toHaveBeenCalled();
  });
});

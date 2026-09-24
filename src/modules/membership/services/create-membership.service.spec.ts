jest.mock('src/common/crypto/bcrypt', () => ({
  hashPassword: jest.fn(),
}));

import { ConflictException, ForbiddenException } from '@nestjs/common';
import { Membership, Role, User } from '@prisma/client';
import { hashPassword } from 'src/common/crypto/bcrypt';
import { FarmRepository } from 'src/modules/farm/repositories/farm.repository';
import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { MembershipRepository } from '../repositories/membership.repository';
import { CreateMembershipService } from './create-membership.service';

describe('CreateMembershipService', () => {
  let service: CreateMembershipService;
  let membershipRepository: jest.Mocked<
    Pick<
      MembershipRepository,
      | 'findOrgAdmin'
      | 'findManyByUserAndOrg'
      | 'createMany'
      | 'createUserWithMemberships'
    >
  >;
  let farmRepository: jest.Mocked<Pick<FarmRepository, 'findById'>>;
  let userRepository: jest.Mocked<
    Pick<UserRepository, 'findById' | 'findByEmail'>
  >;

  const actorId = 'admin-1';
  const organizationId = 'org-1';
  const farmId = 'farm-1';

  const membership = {
    id: 'm-1',
    userId: 'user-new',
    organizationId,
    farmId,
    role: Role.USER,
  } as Membership;

  beforeEach(() => {
    membershipRepository = {
      findOrgAdmin: jest.fn(),
      findManyByUserAndOrg: jest.fn(),
      createMany: jest.fn(),
      createUserWithMemberships: jest.fn(),
    };
    farmRepository = {
      findById: jest.fn(),
    };
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
    };

    service = new CreateMembershipService(
      membershipRepository as unknown as MembershipRepository,
      farmRepository as unknown as FarmRepository,
      userRepository as unknown as UserRepository,
    );

    membershipRepository.findOrgAdmin.mockResolvedValue({
      id: 'm-admin',
    } as Membership);
    farmRepository.findById.mockResolvedValue({
      id: farmId,
      organizationId,
    } as never);
    userRepository.findByEmail.mockResolvedValue(null);
    jest.mocked(hashPassword).mockResolvedValue('hashed-password');
    membershipRepository.createUserWithMemberships.mockResolvedValue({
      userId: 'user-new',
      memberships: [membership],
    });
  });

  it('creates a new user and memberships in a single repository call', async () => {
    const result = await service.execute(actorId, {
      organizationId,
      farmIds: [farmId],
      role: Role.USER,
      name: 'New Operator',
      email: 'new@example.com',
      password: 'Passw0rd!',
    });

    expect(hashPassword).toHaveBeenCalledWith('Passw0rd!');
    expect(membershipRepository.createUserWithMemberships).toHaveBeenCalledWith(
      {
        name: 'New Operator',
        email: 'new@example.com',
        password: 'hashed-password',
        role: Role.USER,
        mustChangePassword: true,
      },
      [
        {
          organizationId,
          farmId,
          role: Role.USER,
        },
      ],
    );
    expect(membershipRepository.createMany).not.toHaveBeenCalled();
    expect(result.membership).toEqual(membership);
  });

  it('attaches an existing user via createMany', async () => {
    const existingUserId = 'user-existing';
    userRepository.findById.mockResolvedValue({ id: existingUserId } as User);
    membershipRepository.findManyByUserAndOrg.mockResolvedValue([]);
    membershipRepository.createMany.mockResolvedValue([
      { ...membership, userId: existingUserId },
    ]);

    const result = await service.execute(actorId, {
      organizationId,
      farmIds: [farmId],
      role: Role.USER,
      userId: existingUserId,
    });

    expect(membershipRepository.createMany).toHaveBeenCalled();
    expect(
      membershipRepository.createUserWithMemberships,
    ).not.toHaveBeenCalled();
    expect(result.membership.userId).toBe(existingUserId);
  });

  it('rejects when the actor is not an organization admin', async () => {
    membershipRepository.findOrgAdmin.mockResolvedValue(null);

    await expect(
      service.execute(actorId, {
        organizationId,
        farmIds: [farmId],
        name: 'New Operator',
        email: 'new@example.com',
        password: 'Passw0rd!',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(
      membershipRepository.createUserWithMemberships,
    ).not.toHaveBeenCalled();
  });

  it('rejects when the email is already taken', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'other-user',
    } as User);

    await expect(
      service.execute(actorId, {
        organizationId,
        farmIds: [farmId],
        name: 'New Operator',
        email: 'new@example.com',
        password: 'Passw0rd!',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(
      membershipRepository.createUserWithMemberships,
    ).not.toHaveBeenCalled();
  });
});

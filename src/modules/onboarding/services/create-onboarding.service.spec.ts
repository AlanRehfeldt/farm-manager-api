import { ConflictException } from '@nestjs/common';
import { PlatformRole, Role } from '@prisma/client';
import { FarmRepository } from 'src/modules/farm/repositories/farm.repository';
import { MembershipRepository } from 'src/modules/membership/repositories/membership.repository';
import { OrganizationRepository } from 'src/modules/organization/repositories/organization.repository';
import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { CreateOnboardingService } from './create-onboarding.service';

describe('CreateOnboardingService', () => {
  const organizationRepository: jest.Mocked<
    Pick<OrganizationRepository, 'findByIdForUser'>
  > = {
    findByIdForUser: jest.fn(),
  };
  const membershipRepository: jest.Mocked<
    Pick<MembershipRepository, 'findManyByUser'>
  > = {
    findManyByUser: jest.fn(),
  };
  const farmRepository: jest.Mocked<
    Pick<FarmRepository, 'countByOrganization' | 'create'>
  > = {
    countByOrganization: jest.fn(),
    create: jest.fn(),
  };
  const userRepository: jest.Mocked<Pick<UserRepository, 'findById'>> = {
    findById: jest.fn(),
  };

  const service = new CreateOnboardingService(
    organizationRepository as unknown as OrganizationRepository,
    membershipRepository as unknown as MembershipRepository,
    farmRepository as unknown as FarmRepository,
    userRepository as unknown as UserRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      platformRole: PlatformRole.NONE,
    } as never);
    membershipRepository.findManyByUser.mockResolvedValue([
      {
        organizationId: 'org-1',
        role: Role.ADMIN,
        farmId: null,
      },
      {
        organizationId: 'org-2',
        role: Role.USER,
        farmId: null,
      },
    ] as never);
    farmRepository.countByOrganization.mockResolvedValue(0);
    farmRepository.create.mockResolvedValue({ id: 'farm-1' } as never);
    organizationRepository.findByIdForUser.mockResolvedValue({
      id: 'org-1',
    } as never);
  });

  it('creates the first farm of the organization bound to the token', async () => {
    const result = await service.execute(
      'user-1',
      { farmName: 'Sede' },
      'org-1',
    );

    expect(farmRepository.create).toHaveBeenCalledWith({
      organizationId: 'org-1',
      name: 'Sede',
      timezone: undefined,
    });
    expect(result.farm).toEqual({ id: 'farm-1' });
  });

  it('rejects onboarding without a bound organization', async () => {
    await expect(
      service.execute('user-1', { farmName: 'Sede' }, null),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(farmRepository.create).not.toHaveBeenCalled();
  });
});

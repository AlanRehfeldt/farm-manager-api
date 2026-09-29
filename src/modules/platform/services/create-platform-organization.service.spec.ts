jest.mock('src/common/crypto/bcrypt', () => ({
  hashPassword: jest.fn(),
}));

import { ConflictException } from '@nestjs/common';
import { Farm, Organization, PlatformRole, Prisma } from '@prisma/client';
import { hashPassword } from 'src/common/crypto/bcrypt';
import { SeedCostCategoriesService } from 'src/modules/cost-category/services/seed-cost-categories.service';
import { PlatformRepository } from '../repositories/platform.repository';
import { CreatePlatformOrganizationService } from './create-platform-organization.service';

describe('CreatePlatformOrganizationService', () => {
  let service: CreatePlatformOrganizationService;
  let platformRepository: jest.Mocked<
    Pick<PlatformRepository, 'provisionOrganization'>
  >;
  let seedCostCategoriesService: jest.Mocked<
    Pick<SeedCostCategoriesService, 'execute'>
  >;

  const organization = { id: 'org-1', name: 'Rehfeldt Agro' } as Organization;
  const farm = { id: 'farm-1', organizationId: 'org-1', name: 'Sede' } as Farm;
  const admin = {
    id: 'user-1',
    name: 'Cliente Admin',
    email: 'admin@example.com',
    platformRole: PlatformRole.NONE,
    mustChangePassword: true,
    createdAt: new Date('2026-09-29T00:00:00.000Z'),
    updatedAt: new Date('2026-09-29T00:00:00.000Z'),
  };

  beforeEach(() => {
    platformRepository = {
      provisionOrganization: jest.fn(),
    };
    seedCostCategoriesService = {
      execute: jest.fn(),
    };
    service = new CreatePlatformOrganizationService(
      platformRepository as unknown as PlatformRepository,
      seedCostCategoriesService as unknown as SeedCostCategoriesService,
    );
    jest.mocked(hashPassword).mockResolvedValue('hashed-password');
    platformRepository.provisionOrganization.mockResolvedValue({
      organization,
      farm,
      admin,
    });
    seedCostCategoriesService.execute.mockResolvedValue({ categories: [] });
  });

  it('provisions the client admin and seeds cost categories', async () => {
    const result = await service.execute({
      organizationName: 'Rehfeldt Agro',
      farmName: 'Sede',
      timezone: 'America/Bahia',
      admin: {
        name: 'Cliente Admin',
        email: 'admin@example.com',
        password: 'Admin1!x',
      },
    });

    expect(hashPassword).toHaveBeenCalledWith('Admin1!x');
    expect(platformRepository.provisionOrganization).toHaveBeenCalledWith({
      organizationName: 'Rehfeldt Agro',
      farmName: 'Sede',
      timezone: 'America/Bahia',
      admin: {
        name: 'Cliente Admin',
        email: 'admin@example.com',
        passwordHash: 'hashed-password',
      },
    });
    expect(seedCostCategoriesService.execute).toHaveBeenCalledWith('org-1');
    expect(result.admin.mustChangePassword).toBe(true);
    expect(result).not.toHaveProperty('password');
  });

  it('maps a duplicate email to 409 and does not seed categories', async () => {
    platformRepository.provisionOrganization.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '7.10.0',
      }),
    );

    await expect(
      service.execute({
        organizationName: 'Outra',
        farmName: 'Sede',
        admin: {
          name: 'Cliente Admin',
          email: 'admin@example.com',
          password: 'Admin1!x',
        },
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(seedCostCategoriesService.execute).not.toHaveBeenCalled();
  });
});

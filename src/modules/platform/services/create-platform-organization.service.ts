import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { hashPassword } from 'src/common/crypto/bcrypt';
import { SeedCostCategoriesService } from 'src/modules/cost-category/services/seed-cost-categories.service';
import {
  PLATFORM_REPOSITORY,
  PlatformRepository,
} from '../repositories/platform.repository';

type CreatePlatformOrganizationInput = {
  organizationName: string;
  farmName: string;
  timezone?: string;
  admin: {
    name: string;
    email: string;
    password: string;
  };
};

@Injectable()
export class CreatePlatformOrganizationService {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: PlatformRepository,
    private readonly seedCostCategoriesService: SeedCostCategoriesService,
  ) {}

  async execute(input: CreatePlatformOrganizationInput, actorUserId: string) {
    const passwordHash = await hashPassword(input.admin.password);

    try {
      const provisioned = await this.platformRepository.provisionOrganization(
        {
          organizationName: input.organizationName,
          farmName: input.farmName,
          timezone: input.timezone,
          admin: {
            name: input.admin.name,
            email: input.admin.email,
            passwordHash,
          },
        },
        actorUserId,
      );

      await this.seedCostCategoriesService.execute(provisioned.organization.id);

      return provisioned;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }
  }
}

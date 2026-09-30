import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ADOPTION_ACTIVE_DAYS,
  adoptionWindowStart,
} from '../domain/adoption-window';
import { PlatformOrganizationDetail } from '../repositories/@types';
import {
  PLATFORM_REPOSITORY,
  PlatformRepository,
} from '../repositories/platform.repository';

@Injectable()
export class GetPlatformOrganizationService {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: PlatformRepository,
  ) {}

  async execute(organizationId: string): Promise<PlatformOrganizationDetail> {
    const organization =
      await this.platformRepository.findOrganizationById(organizationId);

    if (!organization) {
      throw new NotFoundException('Organization does not exist');
    }

    const since = adoptionWindowStart(new Date(), ADOPTION_ACTIVE_DAYS);
    const [usage, farmCount] = await Promise.all([
      this.platformRepository.organizationUsage(organizationId, since),
      this.platformRepository.countOrganizationFarms({
        organizationId,
        page: 1,
        perPage: 1,
        orderBy: 'name',
        orderDirection: 'asc',
      }),
    ]);

    return {
      id: organization.id,
      name: organization.name,
      status: organization.status,
      city: organization.city,
      state: organization.state,
      cnpj: organization.cnpj,
      phone: organization.phone,
      email: organization.email,
      street: organization.street,
      number: organization.number,
      complement: organization.complement,
      zipCode: organization.zipCode,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      lastAccessAt: organization.lastAccessAt,
      lastActivityAt: organization.lastActivityAt,
      farmCount,
      usage,
    };
  }
}

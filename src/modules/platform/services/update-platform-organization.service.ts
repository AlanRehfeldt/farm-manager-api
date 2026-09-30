import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { cnpj as cnpjValidator } from 'cpf-cnpj-validator';
import { UpdatePlatformOrganizationProfile } from '../repositories/@types';
import {
  PLATFORM_REPOSITORY,
  PlatformRepository,
} from '../repositories/platform.repository';

@Injectable()
export class UpdatePlatformOrganizationService {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: PlatformRepository,
  ) {}

  async execute(
    organizationId: string,
    data: UpdatePlatformOrganizationProfile,
    actorUserId: string,
  ) {
    if (data.cnpj && !cnpjValidator.isValid(data.cnpj)) {
      throw new BadRequestException('Invalid CNPJ');
    }

    const organization =
      await this.platformRepository.updateOrganizationProfile(
        organizationId,
        data,
        actorUserId,
      );

    if (!organization) {
      throw new NotFoundException('Organization does not exist');
    }

    return organization;
  }
}

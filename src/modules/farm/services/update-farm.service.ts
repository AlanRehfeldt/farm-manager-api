import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MEMBERSHIP_REPOSITORY,
  MembershipRepository,
} from 'src/modules/membership/repositories/membership.repository';
import { UpdateFarmData } from '../repositories/@types';
import {
  FARM_REPOSITORY,
  FarmRepository,
} from '../repositories/farm.repository';

@Injectable()
export class UpdateFarmService {
  constructor(
    @Inject(FARM_REPOSITORY)
    private readonly farmRepository: FarmRepository,
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
  ) {}

  async execute(userId: string, data: UpdateFarmData) {
    const farm = await this.farmRepository.findAccessibleByUser(
      data.id,
      userId,
    );

    if (!farm) {
      throw new NotFoundException('Farm does not exist');
    }

    const admin = await this.membershipRepository.findOrgAdmin(
      userId,
      farm.organizationId,
    );

    if (!admin) {
      throw new ForbiddenException('Only organization admins can update farms');
    }

    if (data.name && data.name !== farm.name) {
      const existing = await this.farmRepository.findByOrganizationAndName(
        farm.organizationId,
        data.name,
      );
      if (existing) {
        throw new ConflictException(
          'Farm name already exists in this organization',
        );
      }
    }

    const updated = await this.farmRepository.update(data);

    return { farm: updated };
  }
}

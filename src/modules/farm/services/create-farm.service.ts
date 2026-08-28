import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  MEMBERSHIP_REPOSITORY,
  MembershipRepository,
} from 'src/modules/membership/repositories/membership.repository';
import { CreateFarmData } from '../repositories/@types';
import {
  FARM_REPOSITORY,
  FarmRepository,
} from '../repositories/farm.repository';

@Injectable()
export class CreateFarmService {
  constructor(
    @Inject(FARM_REPOSITORY)
    private readonly farmRepository: FarmRepository,
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
  ) {}

  async execute(userId: string, data: CreateFarmData) {
    const admin = await this.membershipRepository.findOrgAdmin(
      userId,
      data.organizationId,
    );

    if (!admin) {
      throw new ForbiddenException('Only organization admins can create farms');
    }

    const existing = await this.farmRepository.findByOrganizationAndName(
      data.organizationId,
      data.name,
    );

    if (existing) {
      throw new ConflictException(
        'Farm name already exists in this organization',
      );
    }

    const farm = await this.farmRepository.create(data);

    return { farm };
  }
}

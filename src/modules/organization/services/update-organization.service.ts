import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MEMBERSHIP_REPOSITORY,
  MembershipRepository,
} from 'src/modules/membership/repositories/membership.repository';
import { UpdateOrganizationData } from '../repositories/@types';
import {
  ORGANIZATION_REPOSITORY,
  OrganizationRepository,
} from '../repositories/organization.repository';

@Injectable()
export class UpdateOrganizationService {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: OrganizationRepository,
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
  ) {}

  async execute(userId: string, data: UpdateOrganizationData) {
    const organization = await this.organizationRepository.findByIdForUser(
      data.id,
      userId,
    );

    if (!organization) {
      throw new NotFoundException('Organization does not exist');
    }

    const admin = await this.membershipRepository.findOrgAdmin(userId, data.id);

    if (!admin) {
      throw new ForbiddenException(
        'Only organization admins can update the organization',
      );
    }

    const updated = await this.organizationRepository.update(data);

    return { organization: updated };
  }
}

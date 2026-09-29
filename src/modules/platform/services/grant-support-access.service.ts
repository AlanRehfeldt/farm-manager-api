import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationStatus, PlatformRole, Prisma } from '@prisma/client';
import {
  USER_REPOSITORY,
  UserRepository,
} from 'src/modules/user/repositories/user.repository';
import {
  PLATFORM_REPOSITORY,
  PlatformRepository,
} from '../repositories/platform.repository';

type GrantSupportAccessInput = {
  userId: string;
  organizationId: string;
};

@Injectable()
export class GrantSupportAccessService {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: PlatformRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(actorUserId: string, input: GrantSupportAccessInput) {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    if (user.platformRole !== PlatformRole.PLATFORM_SUPPORT) {
      throw new ForbiddenException(
        'Only support users can receive tenant access',
      );
    }

    const organization = await this.platformRepository.findOrganizationById(
      input.organizationId,
    );
    if (!organization) {
      throw new NotFoundException('Organization does not exist');
    }

    if (organization.status !== OrganizationStatus.ACTIVE) {
      throw new ForbiddenException('Organization is suspended');
    }

    try {
      return await this.platformRepository.grantSupportAccess({
        userId: input.userId,
        organizationId: input.organizationId,
        grantedByUserId: actorUserId,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Support access already exists');
      }

      throw error;
    }
  }
}

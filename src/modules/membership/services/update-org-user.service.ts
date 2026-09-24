import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlatformRole, Prisma, Role } from '@prisma/client';
import {
  FARM_REPOSITORY,
  FarmRepository,
} from 'src/modules/farm/repositories/farm.repository';
import {
  USER_REPOSITORY,
  UserRepository,
} from 'src/modules/user/repositories/user.repository';
import {
  MEMBERSHIP_REPOSITORY,
  MembershipRepository,
} from '../repositories/membership.repository';
import { resolveFarmIds } from '../utils/resolve-farm-ids';

type UpdateOrgUserInput = {
  organizationId: string;
  name: string;
  email: string;
  role: Role;
  farmIds: string[];
};

@Injectable()
export class UpdateOrgUserService {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
    @Inject(FARM_REPOSITORY)
    private readonly farmRepository: FarmRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    actorUserId: string,
    userId: string,
    input: UpdateOrgUserInput,
  ) {
    const admin = await this.membershipRepository.findOrgAdmin(
      actorUserId,
      input.organizationId,
    );

    if (!admin) {
      throw new ForbiddenException('Only organization admins can update users');
    }

    const user = await this.userRepository.findById(userId);
    if (!user || user.platformRole !== PlatformRole.NONE) {
      throw new NotFoundException('User does not exist');
    }

    const existing = await this.membershipRepository.findManyByUserAndOrg(
      userId,
      input.organizationId,
    );

    if (existing.length === 0) {
      throw new NotFoundException('User does not exist');
    }

    const farmIds = resolveFarmIds({ farmIds: input.farmIds });
    await this.assertFarmsInOrg(input.organizationId, farmIds);

    const isCurrentlyOrgAdmin = existing.some(
      (item) => item.role === Role.ADMIN && item.farmId === null,
    );
    const becomesOrgAdmin = input.role === Role.ADMIN && farmIds === null;

    if (isCurrentlyOrgAdmin && !becomesOrgAdmin) {
      const adminCount = await this.membershipRepository.countOrgAdmins(
        input.organizationId,
      );
      if (adminCount <= 1) {
        throw new ConflictException(
          'Cannot remove the last admin of the organization',
        );
      }
    }

    if (input.email !== user.email) {
      const emailTaken = await this.userRepository.findByEmail(input.email);
      if (emailTaken && emailTaken.id !== userId) {
        throw new ConflictException('Email already exists');
      }
    }

    const targetFarmIds: Array<string | null> =
      farmIds === null ? [null] : farmIds;
    const rows = targetFarmIds.map((farmId) => ({
      userId,
      organizationId: input.organizationId,
      farmId,
      role: input.role,
    }));

    try {
      const memberships =
        await this.membershipRepository.replaceProfileAndMemberships({
          userId,
          name: input.name,
          email: input.email,
          organizationId: input.organizationId,
          memberships: rows,
        });

      return { memberships };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email or membership already exists');
      }
      throw error;
    }
  }

  private async assertFarmsInOrg(
    organizationId: string,
    farmIds: string[] | null,
  ) {
    if (!farmIds) {
      return;
    }

    for (const farmId of farmIds) {
      const farm = await this.farmRepository.findById(farmId);
      if (!farm || farm.organizationId !== organizationId) {
        throw new NotFoundException('Farm does not exist');
      }
    }
  }
}

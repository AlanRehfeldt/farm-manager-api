import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { hashPassword } from 'src/common/crypto/bcrypt';
import {
  FARM_REPOSITORY,
  FarmRepository,
} from 'src/modules/farm/repositories/farm.repository';
import { resolveFarmIds } from 'src/modules/membership/utils/resolve-farm-ids';
import {
  MEMBERSHIP_REPOSITORY,
  MembershipRepository,
} from 'src/modules/membership/repositories/membership.repository';
import {
  USER_REPOSITORY,
  UserRepository,
} from 'src/modules/user/repositories/user.repository';
import {
  PLATFORM_REPOSITORY,
  PlatformRepository,
} from '../repositories/platform.repository';

type CreatePlatformUserInput = {
  organizationId: string;
  name: string;
  email: string;
  password: string;
  role?: Role;
  farmIds?: string[];
};

@Injectable()
export class CreatePlatformUserService {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: PlatformRepository,
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(FARM_REPOSITORY)
    private readonly farmRepository: FarmRepository,
  ) {}

  async execute(input: CreatePlatformUserInput) {
    const organization = await this.platformRepository.findOrganizationById(
      input.organizationId,
    );

    if (!organization) {
      throw new NotFoundException('Organization does not exist');
    }

    const farmIds = resolveFarmIds({ farmIds: input.farmIds });
    await this.assertFarmsInOrg(input.organizationId, farmIds);

    const emailTaken = await this.userRepository.findByEmail(input.email);
    if (emailTaken) {
      throw new ConflictException('Email already exists');
    }

    const encryptedPassword = await hashPassword(input.password);
    const role = input.role ?? Role.USER;
    const targetFarmIds: Array<string | null> = farmIds ?? [null];

    try {
      const { userId, memberships } =
        await this.membershipRepository.createUserWithMemberships(
          {
            name: input.name,
            email: input.email,
            password: encryptedPassword,
            mustChangePassword: true,
          },
          targetFarmIds.map((farmId) => ({
            organizationId: input.organizationId,
            farmId,
            role,
          })),
        );

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundException('User does not exist');
      }

      const { password, passwordChangedAt, ...safeUser } = user;
      void password;
      void passwordChangedAt;

      return { user: safeUser, memberships };
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

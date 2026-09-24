import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hashPassword } from 'src/common/crypto/bcrypt';
import { Prisma, Role } from '@prisma/client';
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

type CreateMembershipInput = {
  organizationId: string;
  farmId?: string | null;
  farmIds?: string[];
  role?: Role;
  userId?: string;
  name?: string;
  email?: string;
  password?: string;
};

@Injectable()
export class CreateMembershipService {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
    @Inject(FARM_REPOSITORY)
    private readonly farmRepository: FarmRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(actorUserId: string, input: CreateMembershipInput) {
    const admin = await this.membershipRepository.findOrgAdmin(
      actorUserId,
      input.organizationId,
    );

    if (!admin) {
      throw new ForbiddenException(
        'Only organization admins can create memberships',
      );
    }

    const farmIds = resolveFarmIds(input);
    await this.assertFarmsInOrg(input.organizationId, farmIds);

    const role = input.role ?? Role.USER;
    const targetFarmIds: Array<string | null> = farmIds ?? [null];

    if (input.userId) {
      return this.attachExistingUser(input.userId, input, role, targetFarmIds);
    }

    return this.createNewUser(input, role, targetFarmIds);
  }

  private async attachExistingUser(
    userId: string,
    input: CreateMembershipInput,
    role: Role,
    targetFarmIds: Array<string | null>,
  ) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    const existing = await this.membershipRepository.findManyByUserAndOrg(
      userId,
      input.organizationId,
    );

    this.assertNoMembershipConflict(existing, targetFarmIds);

    const rows = targetFarmIds.map((farmId) => ({
      userId,
      organizationId: input.organizationId,
      farmId,
      role,
    }));

    try {
      const memberships = await this.membershipRepository.createMany(rows);
      return { membership: memberships[0] };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Membership already exists');
      }
      throw error;
    }
  }

  private async createNewUser(
    input: CreateMembershipInput,
    role: Role,
    targetFarmIds: Array<string | null>,
  ) {
    if (!input.name || !input.email || !input.password) {
      throw new ConflictException('Provide userId or name, email and password');
    }

    const emailTaken = await this.userRepository.findByEmail(input.email);
    if (emailTaken) {
      throw new ConflictException('Email already exists');
    }

    const encryptedPassword = await hashPassword(input.password);
    const membershipRows = targetFarmIds.map((farmId) => ({
      organizationId: input.organizationId,
      farmId,
      role,
    }));

    try {
      const { memberships } =
        await this.membershipRepository.createUserWithMemberships(
          {
            name: input.name,
            email: input.email,
            password: encryptedPassword,
            role: Role.USER,
            mustChangePassword: true,
          },
          membershipRows,
        );

      return { membership: memberships[0] };
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

  private assertNoMembershipConflict(
    existing: Array<{ farmId: string | null }>,
    targetFarmIds: Array<string | null>,
  ) {
    const existingHasOrgWide = existing.some((item) => item.farmId === null);
    const creatingOrgWide = targetFarmIds.includes(null);

    if (existingHasOrgWide && !creatingOrgWide) {
      throw new BadRequestException(
        'Cannot mix org-wide and farm-scoped memberships',
      );
    }

    if (creatingOrgWide && existing.length > 0) {
      throw new BadRequestException(
        'Cannot mix org-wide and farm-scoped memberships',
      );
    }

    const existingFarmIds = new Set(
      existing.map((item) => item.farmId).filter((id): id is string => !!id),
    );

    for (const farmId of targetFarmIds) {
      if (farmId === null) {
        if (existingHasOrgWide) {
          throw new ConflictException('Membership already exists');
        }
        continue;
      }

      if (existingFarmIds.has(farmId)) {
        throw new ConflictException('Membership already exists');
      }
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

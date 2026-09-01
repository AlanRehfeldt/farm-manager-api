import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hashPassword } from 'src/common/crypto/bcrypt';
import { Role } from '@prisma/client';
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

type CreateMembershipInput = {
  organizationId: string;
  farmId?: string | null;
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

    const farmId = input.farmId ?? null;

    if (farmId) {
      const farm = await this.farmRepository.findById(farmId);
      if (!farm || farm.organizationId !== input.organizationId) {
        throw new NotFoundException('Farm does not exist');
      }
    }

    const userId = await this.resolveUserId(input);

    const existing = await this.membershipRepository.findByUserAndOrgAndFarm(
      userId,
      input.organizationId,
      farmId,
    );

    if (existing) {
      throw new ConflictException('Membership already exists');
    }

    const membership = await this.membershipRepository.create({
      userId,
      organizationId: input.organizationId,
      farmId,
      role: input.role ?? Role.USER,
    });

    return { membership };
  }

  private async resolveUserId(input: CreateMembershipInput): Promise<string> {
    if (input.userId) {
      const user = await this.userRepository.findById(input.userId);
      if (!user) {
        throw new NotFoundException('User does not exist');
      }
      return user.id;
    }

    if (!input.name || !input.email || !input.password) {
      throw new ConflictException('Provide userId or name, email and password');
    }

    const emailTaken = await this.userRepository.findByEmail(input.email);
    if (emailTaken) {
      throw new ConflictException('Email already exists');
    }

    const encryptedPassword = await hashPassword(input.password);
    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      password: encryptedPassword,
      role: Role.USER,
    });

    return user.id;
  }
}

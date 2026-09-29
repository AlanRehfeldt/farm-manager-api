import {
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { hashPassword } from 'src/common/crypto/bcrypt';
import {
  USER_REPOSITORY,
  UserRepository,
} from 'src/modules/user/repositories/user.repository';
import {
  PLATFORM_REPOSITORY,
  PlatformRepository,
} from '../repositories/platform.repository';

type CreateSupportUserInput = {
  name: string;
  email: string;
  password: string;
};

@Injectable()
export class CreateSupportUserService {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: PlatformRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(actorUserId: string, input: CreateSupportUserInput) {
    const emailTaken = await this.userRepository.findByEmail(input.email);
    if (emailTaken) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await hashPassword(input.password);

    try {
      return await this.platformRepository.createSupportUser({
        name: input.name,
        email: input.email,
        passwordHash,
        actorUserId,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }
  }
}

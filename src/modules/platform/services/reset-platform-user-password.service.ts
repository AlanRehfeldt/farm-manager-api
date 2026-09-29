import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { hashPassword } from 'src/common/crypto/bcrypt';
import {
  PLATFORM_REPOSITORY,
  PlatformRepository,
} from '../repositories/platform.repository';

@Injectable()
export class ResetPlatformUserPasswordService {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: PlatformRepository,
  ) {}

  async execute(userId: string, password: string) {
    const passwordHash = await hashPassword(password);
    const updated = await this.platformRepository.resetUserPassword(
      userId,
      passwordHash,
    );

    if (!updated) {
      throw new NotFoundException('User does not exist');
    }
  }
}

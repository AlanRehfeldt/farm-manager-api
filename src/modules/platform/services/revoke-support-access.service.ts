import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  PLATFORM_REPOSITORY,
  PlatformRepository,
} from '../repositories/platform.repository';

@Injectable()
export class RevokeSupportAccessService {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: PlatformRepository,
  ) {}

  async execute(id: string, actorUserId: string) {
    const access = await this.platformRepository.revokeSupportAccess(
      id,
      actorUserId,
    );

    if (!access) {
      throw new NotFoundException('Support access does not exist');
    }

    return access;
  }
}

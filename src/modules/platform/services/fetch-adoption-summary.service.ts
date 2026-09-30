import { Inject, Injectable } from '@nestjs/common';
import { AdoptionSummary } from '../repositories/@types';
import {
  PLATFORM_REPOSITORY,
  PlatformRepository,
} from '../repositories/platform.repository';

@Injectable()
export class FetchAdoptionSummaryService {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: PlatformRepository,
  ) {}

  execute(now = new Date()): Promise<AdoptionSummary> {
    return this.platformRepository.adoptionSummary(now);
  }
}

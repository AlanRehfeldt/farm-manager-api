import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  FARM_REPOSITORY,
  FarmRepository,
} from '../repositories/farm.repository';

@Injectable()
export class GetFarmService {
  constructor(
    @Inject(FARM_REPOSITORY)
    private readonly farmRepository: FarmRepository,
  ) {}

  async execute(id: string, userId: string) {
    const farm = await this.farmRepository.findAccessibleByUser(id, userId);

    if (!farm) {
      throw new NotFoundException('Farm does not exist');
    }

    return { farm };
  }
}

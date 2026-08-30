import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { toVarietyResponse } from '../mappers/variety.mapper';
import {
  VARIETY_REPOSITORY,
  VarietyRepository,
} from '../repositories/variety.repository';

@Injectable()
export class GetVarietyService {
  constructor(
    @Inject(VARIETY_REPOSITORY)
    private readonly varietyRepository: VarietyRepository,
  ) {}

  async execute(id: string, organizationId: string) {
    const variety = await this.varietyRepository.findById(id, organizationId);
    if (!variety) {
      throw new NotFoundException('Variety does not exist');
    }

    return { variety: toVarietyResponse(variety) };
  }
}

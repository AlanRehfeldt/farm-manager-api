import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { toVarietyResponse } from '../mappers/variety.mapper';
import {
  VARIETY_REPOSITORY,
  VarietyRepository,
} from '../repositories/variety.repository';

type UpdateVarietyInput = {
  id: string;
  name?: string;
  externalRef?: string | null;
  organizationId: string;
};

@Injectable()
export class UpdateVarietyService {
  constructor(
    @Inject(VARIETY_REPOSITORY)
    private readonly varietyRepository: VarietyRepository,
  ) {}

  async execute(input: UpdateVarietyInput) {
    const existing = await this.varietyRepository.findById(
      input.id,
      input.organizationId,
    );
    if (!existing) {
      throw new NotFoundException('Variety does not exist');
    }

    if (input.name && input.name !== existing.name) {
      const duplicate = await this.varietyRepository.findByName(
        existing.cropId,
        input.name,
      );
      if (duplicate) {
        throw new ConflictException('Variety name already exists');
      }
    }

    const variety = await this.varietyRepository.update({
      id: input.id,
      name: input.name,
      externalRef: input.externalRef,
    });

    return { variety: toVarietyResponse(variety) };
  }
}

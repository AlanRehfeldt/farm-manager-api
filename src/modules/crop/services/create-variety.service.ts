import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { toVarietyResponse } from '../mappers/variety.mapper';
import {
  CROP_REPOSITORY,
  CropRepository,
} from '../repositories/crop.repository';
import {
  VARIETY_REPOSITORY,
  VarietyRepository,
} from '../repositories/variety.repository';

type CreateVarietyInput = {
  cropId: string;
  name: string;
  externalRef?: string | null;
  organizationId: string;
};

@Injectable()
export class CreateVarietyService {
  constructor(
    @Inject(VARIETY_REPOSITORY)
    private readonly varietyRepository: VarietyRepository,
    @Inject(CROP_REPOSITORY)
    private readonly cropRepository: CropRepository,
  ) {}

  async execute(input: CreateVarietyInput) {
    const crop = await this.cropRepository.findById(
      input.cropId,
      input.organizationId,
    );
    if (!crop) {
      throw new NotFoundException('Crop does not exist');
    }

    const existing = await this.varietyRepository.findByName(
      input.cropId,
      input.name,
    );
    if (existing) {
      throw new ConflictException('Variety name already exists');
    }

    const variety = await this.varietyRepository.create({
      cropId: input.cropId,
      name: input.name,
      externalRef: input.externalRef,
    });

    return { variety: toVarietyResponse(variety) };
  }
}

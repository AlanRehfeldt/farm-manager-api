import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { toCropResponse } from '../mappers/crop.mapper';
import {
  CROP_REPOSITORY,
  CropRepository,
} from '../repositories/crop.repository';

@Injectable()
export class GetCropService {
  constructor(
    @Inject(CROP_REPOSITORY)
    private readonly cropRepository: CropRepository,
  ) {}

  async execute(id: string, organizationId: string) {
    const crop = await this.cropRepository.findById(id, organizationId);
    if (!crop) {
      throw new NotFoundException('Crop does not exist');
    }

    return { crop: toCropResponse(crop) };
  }
}

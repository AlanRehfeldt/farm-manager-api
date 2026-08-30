import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { toCropPlantingResponse } from '../mappers/crop-season.mapper';
import {
  CROP_PLANTING_REPOSITORY,
  CropPlantingRepository,
} from '../repositories/crop-planting.repository';

@Injectable()
export class GetCropPlantingService {
  constructor(
    @Inject(CROP_PLANTING_REPOSITORY)
    private readonly cropPlantingRepository: CropPlantingRepository,
  ) {}

  async execute(id: string, farmId: string) {
    const cropPlanting = await this.cropPlantingRepository.findById(id, farmId);
    if (!cropPlanting) {
      throw new NotFoundException('Crop planting does not exist');
    }

    return { cropPlanting: toCropPlantingResponse(cropPlanting) };
  }
}

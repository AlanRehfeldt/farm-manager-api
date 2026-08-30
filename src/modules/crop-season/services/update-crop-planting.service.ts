import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CropSeasonStatus, Prisma } from '@prisma/client';
import { parseDecimal } from 'src/common/serialization/decimal';
import {
  VARIETY_REPOSITORY,
  VarietyRepository,
} from 'src/modules/crop/repositories/variety.repository';
import { toCropPlantingResponse } from '../mappers/crop-season.mapper';
import {
  CROP_PLANTING_REPOSITORY,
  CropPlantingRepository,
} from '../repositories/crop-planting.repository';
import {
  CROP_SEASON_REPOSITORY,
  CropSeasonRepository,
} from '../repositories/crop-season.repository';

type UpdateCropPlantingInput = {
  id: string;
  varietyId?: string | null;
  plantedAreaHa?: string | number | null;
  farmId: string;
  organizationId: string;
};

@Injectable()
export class UpdateCropPlantingService {
  constructor(
    @Inject(CROP_PLANTING_REPOSITORY)
    private readonly cropPlantingRepository: CropPlantingRepository,
    @Inject(CROP_SEASON_REPOSITORY)
    private readonly cropSeasonRepository: CropSeasonRepository,
    @Inject(VARIETY_REPOSITORY)
    private readonly varietyRepository: VarietyRepository,
  ) {}

  async execute(input: UpdateCropPlantingInput) {
    const existing = await this.cropPlantingRepository.findById(
      input.id,
      input.farmId,
    );
    if (!existing) {
      throw new NotFoundException('Crop planting does not exist');
    }

    const cropSeason = await this.cropSeasonRepository.findById(
      existing.cropSeasonId,
      input.farmId,
    );
    if (!cropSeason) {
      throw new NotFoundException('Crop season does not exist');
    }

    if (cropSeason.status === CropSeasonStatus.CLOSED) {
      throw new ConflictException('Closed crop season plantings cannot be updated');
    }

    if (input.varietyId) {
      const variety = await this.varietyRepository.findById(
        input.varietyId,
        input.organizationId,
      );
      if (!variety || variety.cropId !== cropSeason.cropId) {
        throw new NotFoundException('Variety does not exist for this crop');
      }
    }

    let plantedAreaHa: Prisma.Decimal | null | undefined;
    if (input.plantedAreaHa !== undefined) {
      plantedAreaHa =
        input.plantedAreaHa == null ? null : parseDecimal(input.plantedAreaHa);
      if (plantedAreaHa != null && plantedAreaHa.lte(0)) {
        throw new BadRequestException('plantedAreaHa must be greater than 0');
      }
    }

    const cropPlanting = await this.cropPlantingRepository.update({
      id: input.id,
      varietyId: input.varietyId,
      plantedAreaHa,
    });

    return { cropPlanting: toCropPlantingResponse(cropPlanting) };
  }
}

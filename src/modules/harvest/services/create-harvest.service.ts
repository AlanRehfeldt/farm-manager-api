import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CropSeasonStatus, HarvestQualityClass } from '@prisma/client';
import {
  CROP_PLANTING_REPOSITORY,
  CropPlantingRepository,
} from 'src/modules/crop-season/repositories/crop-planting.repository';
import {
  CROP_SEASON_REPOSITORY,
  CropSeasonRepository,
} from 'src/modules/crop-season/repositories/crop-season.repository';
import { toHarvestResponse } from '../mappers/harvest.mapper';
import {
  HARVEST_REPOSITORY,
  HarvestRepository,
} from '../repositories/harvest.repository';
import { HarvestItemInput } from '../repositories/@types';

type CreateHarvestInput = {
  farmId: string;
  cropSeasonId: string;
  fieldId: string;
  date: Date;
  lotCode?: string | null;
  note?: string | null;
  items: HarvestItemInput[];
};

@Injectable()
export class CreateHarvestService {
  constructor(
    @Inject(HARVEST_REPOSITORY)
    private readonly harvestRepository: HarvestRepository,
    @Inject(CROP_SEASON_REPOSITORY)
    private readonly cropSeasonRepository: CropSeasonRepository,
    @Inject(CROP_PLANTING_REPOSITORY)
    private readonly cropPlantingRepository: CropPlantingRepository,
  ) {}

  async execute(input: CreateHarvestInput) {
    if (input.items.length === 0) {
      throw new BadRequestException('Harvest must have at least one item');
    }

    const cropSeason = await this.cropSeasonRepository.findById(
      input.cropSeasonId,
      input.farmId,
    );
    if (!cropSeason) {
      throw new NotFoundException('Crop season not found');
    }
    if (cropSeason.status !== CropSeasonStatus.ACTIVE) {
      throw new ConflictException('Harvest requires an active crop season');
    }

    const planting = await this.cropPlantingRepository.findBySeasonAndField(
      input.cropSeasonId,
      input.fieldId,
    );
    if (!planting) {
      throw new BadRequestException('Field is not planted in this crop season');
    }

    const normalizedItems = input.items.map((item) => {
      const quantity = Number(item.quantity);
      if (Number.isNaN(quantity) || quantity <= 0) {
        throw new BadRequestException(
          'Harvest quantity must be greater than zero',
        );
      }

      const uomId = item.uomId ?? cropSeason.productionUomId;
      if (uomId !== cropSeason.productionUomId) {
        throw new BadRequestException(
          'Harvest item UoM must match crop season production UoM',
        );
      }

      return {
        qualityClass: item.qualityClass ?? HarvestQualityClass.OTHER,
        quantity: item.quantity,
        uomId,
      };
    });

    const { harvest } = await this.harvestRepository.create({
      ...input,
      items: normalizedItems,
    });

    return { harvest: toHarvestResponse(harvest) };
  }
}

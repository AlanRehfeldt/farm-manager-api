import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CropSeasonStatus } from '@prisma/client';
import { numberToBigint } from 'src/common/serialization/money';
import {
  UNIT_OF_MEASUREMENT_REPOSITORY,
  UnitOfMeasurementRepository,
} from 'src/modules/unit-of-measurement/repositories/unit-of-measurement.repository';
import { toCropSeasonResponse } from '../mappers/crop-season.mapper';
import {
  CROP_SEASON_REPOSITORY,
  CropSeasonRepository,
} from '../repositories/crop-season.repository';

type UpdateCropSeasonInput = {
  id: string;
  name?: string;
  startDate?: Date;
  endDate?: Date | null;
  productionUomId?: string;
  referenceSalePriceInCents?: number | null;
  farmId: string;
  organizationId: string;
};

@Injectable()
export class UpdateCropSeasonService {
  constructor(
    @Inject(CROP_SEASON_REPOSITORY)
    private readonly cropSeasonRepository: CropSeasonRepository,
    @Inject(UNIT_OF_MEASUREMENT_REPOSITORY)
    private readonly unitOfMeasurementRepository: UnitOfMeasurementRepository,
  ) {}

  async execute(input: UpdateCropSeasonInput) {
    const existing = await this.cropSeasonRepository.findById(
      input.id,
      input.farmId,
    );
    if (!existing) {
      throw new NotFoundException('Crop season does not exist');
    }

    if (existing.status === CropSeasonStatus.CLOSED) {
      throw new ConflictException('Closed crop season cannot be updated');
    }

    if (input.productionUomId) {
      const productionUom = await this.unitOfMeasurementRepository.findById(
        input.productionUomId,
        input.organizationId,
      );
      if (!productionUom) {
        throw new NotFoundException('Unit of measurement does not exist');
      }

      if (
        input.productionUomId !== existing.productionUomId &&
        existing.status === CropSeasonStatus.ACTIVE
      ) {
        const harvestCount = await this.cropSeasonRepository.countHarvests(
          input.id,
        );
        if (harvestCount > 0) {
          throw new ConflictException(
            'Cannot change production unit of measure after harvests exist',
          );
        }
      }
    }

    const startDate = input.startDate ?? existing.startDate;
    const endDate =
      input.endDate !== undefined ? input.endDate : existing.endDate;
    if (endDate && endDate < startDate) {
      throw new BadRequestException(
        'endDate must be greater than or equal to startDate',
      );
    }

    const cropSeason = await this.cropSeasonRepository.update({
      id: input.id,
      name: input.name,
      startDate: input.startDate,
      endDate: input.endDate,
      productionUomId: input.productionUomId,
      referenceSalePriceInCents:
        input.referenceSalePriceInCents !== undefined
          ? input.referenceSalePriceInCents == null
            ? null
            : numberToBigint(input.referenceSalePriceInCents)
          : undefined,
    });

    return { cropSeason: toCropSeasonResponse(cropSeason) };
  }
}

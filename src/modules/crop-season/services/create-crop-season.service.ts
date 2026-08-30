import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CropSeasonStatus } from '@prisma/client';
import { numberToBigint } from 'src/common/serialization/money';
import {
  CROP_REPOSITORY,
  CropRepository,
} from 'src/modules/crop/repositories/crop.repository';
import {
  UNIT_OF_MEASUREMENT_REPOSITORY,
  UnitOfMeasurementRepository,
} from 'src/modules/unit-of-measurement/repositories/unit-of-measurement.repository';
import { toCropSeasonResponse } from '../mappers/crop-season.mapper';
import {
  CROP_SEASON_REPOSITORY,
  CropSeasonRepository,
} from '../repositories/crop-season.repository';

type CreateCropSeasonInput = {
  name: string;
  cropId: string;
  startDate: Date;
  endDate?: Date | null;
  productionUomId: string;
  referenceSalePriceInCents?: number | null;
  farmId: string;
  organizationId: string;
};

@Injectable()
export class CreateCropSeasonService {
  constructor(
    @Inject(CROP_SEASON_REPOSITORY)
    private readonly cropSeasonRepository: CropSeasonRepository,
    @Inject(CROP_REPOSITORY)
    private readonly cropRepository: CropRepository,
    @Inject(UNIT_OF_MEASUREMENT_REPOSITORY)
    private readonly unitOfMeasurementRepository: UnitOfMeasurementRepository,
  ) {}

  async execute(input: CreateCropSeasonInput) {
    const crop = await this.cropRepository.findById(
      input.cropId,
      input.organizationId,
    );
    if (!crop) {
      throw new NotFoundException('Crop does not exist');
    }

    const productionUom = await this.unitOfMeasurementRepository.findById(
      input.productionUomId,
      input.organizationId,
    );
    if (!productionUom) {
      throw new NotFoundException('Unit of measurement does not exist');
    }

    if (input.endDate && input.endDate < input.startDate) {
      throw new BadRequestException(
        'endDate must be greater than or equal to startDate',
      );
    }

    const cropSeason = await this.cropSeasonRepository.create({
      name: input.name,
      cropId: input.cropId,
      startDate: input.startDate,
      endDate: input.endDate,
      status: CropSeasonStatus.PLANNED,
      productionUomId: input.productionUomId,
      referenceSalePriceInCents:
        input.referenceSalePriceInCents != null
          ? numberToBigint(input.referenceSalePriceInCents)
          : null,
      farmId: input.farmId,
    });

    return { cropSeason: toCropSeasonResponse(cropSeason) };
  }
}

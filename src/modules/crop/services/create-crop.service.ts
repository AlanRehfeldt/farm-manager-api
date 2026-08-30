import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  UNIT_OF_MEASUREMENT_REPOSITORY,
  UnitOfMeasurementRepository,
} from 'src/modules/unit-of-measurement/repositories/unit-of-measurement.repository';
import { toCropResponse } from '../mappers/crop.mapper';
import {
  CROP_REPOSITORY,
  CropRepository,
} from '../repositories/crop.repository';

type CreateCropInput = {
  name: string;
  defaultProductionUomId?: string;
  externalRef?: string | null;
  organizationId: string;
};

@Injectable()
export class CreateCropService {
  constructor(
    @Inject(CROP_REPOSITORY)
    private readonly cropRepository: CropRepository,
    @Inject(UNIT_OF_MEASUREMENT_REPOSITORY)
    private readonly unitOfMeasurementRepository: UnitOfMeasurementRepository,
  ) {}

  async execute(input: CreateCropInput) {
    if (input.defaultProductionUomId) {
      const unitOfMeasurement = await this.unitOfMeasurementRepository.findById(
        input.defaultProductionUomId,
        input.organizationId,
      );
      if (!unitOfMeasurement) {
        throw new NotFoundException('Unit of measurement does not exist');
      }
    }

    const existing = await this.cropRepository.findByName(
      input.organizationId,
      input.name,
    );
    if (existing) {
      throw new ConflictException('Crop name already exists');
    }

    const crop = await this.cropRepository.create({
      name: input.name,
      defaultProductionUomId: input.defaultProductionUomId,
      externalRef: input.externalRef,
      organizationId: input.organizationId,
    });

    return { crop: toCropResponse(crop) };
  }
}

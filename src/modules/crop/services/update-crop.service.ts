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

type UpdateCropInput = {
  id: string;
  name?: string;
  defaultProductionUomId?: string | null;
  externalRef?: string | null;
  organizationId: string;
};

@Injectable()
export class UpdateCropService {
  constructor(
    @Inject(CROP_REPOSITORY)
    private readonly cropRepository: CropRepository,
    @Inject(UNIT_OF_MEASUREMENT_REPOSITORY)
    private readonly unitOfMeasurementRepository: UnitOfMeasurementRepository,
  ) {}

  async execute(input: UpdateCropInput) {
    const existing = await this.cropRepository.findById(
      input.id,
      input.organizationId,
    );
    if (!existing) {
      throw new NotFoundException('Crop does not exist');
    }

    if (input.name && input.name !== existing.name) {
      const duplicate = await this.cropRepository.findByName(
        input.organizationId,
        input.name,
      );
      if (duplicate) {
        throw new ConflictException('Crop name already exists');
      }
    }

    if (input.defaultProductionUomId) {
      const unitOfMeasurement = await this.unitOfMeasurementRepository.findById(
        input.defaultProductionUomId,
        input.organizationId,
      );
      if (!unitOfMeasurement) {
        throw new NotFoundException('Unit of measurement does not exist');
      }
    }

    const crop = await this.cropRepository.update({
      id: input.id,
      name: input.name,
      defaultProductionUomId: input.defaultProductionUomId,
      externalRef: input.externalRef,
    });

    return { crop: toCropResponse(crop) };
  }
}

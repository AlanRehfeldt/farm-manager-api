import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  UNIT_OF_MEASUREMENT_REPOSITORY,
  UnitOfMeasurementRepository,
} from '../repositories/unit-of-measurement.repository';
import { toUnitOfMeasurementResponse } from '../mappers/unit-of-measurement.mapper';

@Injectable()
export class GetUnitOfMeasurementService {
  constructor(
    @Inject(UNIT_OF_MEASUREMENT_REPOSITORY)
    private readonly unitOfMeasurementRepository: UnitOfMeasurementRepository,
  ) {}

  async execute(id: string, organizationId: string) {
    const unitOfMeasurement = await this.unitOfMeasurementRepository.findById(
      id,
      organizationId,
    );

    if (!unitOfMeasurement) {
      throw new NotFoundException('Unit of measurement does not exist');
    }

    return {
      unitOfMeasurement: toUnitOfMeasurementResponse(unitOfMeasurement),
    };
  }
}

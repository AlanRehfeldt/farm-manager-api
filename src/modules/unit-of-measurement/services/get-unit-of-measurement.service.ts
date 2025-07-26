import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  UNIT_OF_MEASUREMENT_REPOSITORY,
  UnitOfMeasurementRepository,
} from '../repositories/unit-of-measurement.repository';

@Injectable()
export class GetUnitOfMeasurementService {
  constructor(
    @Inject(UNIT_OF_MEASUREMENT_REPOSITORY)
    private readonly unitOfMeasurementRepository: UnitOfMeasurementRepository,
  ) {}

  async execute(id: string) {
    const unitOfMeasurement =
      await this.unitOfMeasurementRepository.findById(id);

    if (!unitOfMeasurement) {
      throw new NotFoundException('Unit of measurement does not exist');
    }

    return { unitOfMeasurement };
  }
}

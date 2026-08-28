import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  UNIT_OF_MEASUREMENT_REPOSITORY,
  UnitOfMeasurementRepository,
} from '../repositories/unit-of-measurement.repository';

@Injectable()
export class DeleteUnitOfMeasurementService {
  constructor(
    @Inject(UNIT_OF_MEASUREMENT_REPOSITORY)
    private readonly unitOfMeasurementRepository: UnitOfMeasurementRepository,
  ) {}

  async execute(id: string, organizationId: string) {
    const existing = await this.unitOfMeasurementRepository.findById(
      id,
      organizationId,
    );
    if (!existing) {
      throw new NotFoundException('Unit of measurement does not exist');
    }

    return await this.unitOfMeasurementRepository.delete(id);
  }
}

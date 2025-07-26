import { ConflictException, Inject, Injectable } from '@nestjs/common';
import {
  UNIT_OF_MEASUREMENT_REPOSITORY,
  UnitOfMeasurementRepository,
} from '../repositories/unit-of-measurement.repository';
import { CreateUnitOfMeasurementData } from '../repositories/@types';

@Injectable()
export class CreateUnitOfMeasurementService {
  constructor(
    @Inject(UNIT_OF_MEASUREMENT_REPOSITORY)
    private readonly unitOfMeasurementRepository: UnitOfMeasurementRepository,
  ) {}

  async execute({ name, acronym }: CreateUnitOfMeasurementData) {
    const checkIfAcronymExists =
      await this.unitOfMeasurementRepository.findByAcronym(acronym);
    if (checkIfAcronymExists) {
      throw new ConflictException('Acronym already exists');
    }

    const unitOfMeasurement = await this.unitOfMeasurementRepository.create({
      name,
      acronym,
    });

    return { unitOfMeasurement };
  }
}

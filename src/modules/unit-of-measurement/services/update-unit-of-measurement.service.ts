import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUnitOfMeasurementData } from '../repositories/@types';
import {
  UNIT_OF_MEASUREMENT_REPOSITORY,
  UnitOfMeasurementRepository,
} from '../repositories/unit-of-measurement.repository';

@Injectable()
export class UpdateUnitOfMeasurementService {
  constructor(
    @Inject(UNIT_OF_MEASUREMENT_REPOSITORY)
    private readonly unitOfMeasurementRepository: UnitOfMeasurementRepository,
  ) {}

  async execute(
    organizationId: string,
    { id, name, acronym }: UpdateUnitOfMeasurementData,
  ) {
    const existing = await this.unitOfMeasurementRepository.findById(
      id,
      organizationId,
    );
    if (!existing) {
      throw new NotFoundException('Unit of measurement does not exist');
    }

    if (acronym) {
      const duplicate = await this.unitOfMeasurementRepository.findByAcronym(
        organizationId,
        acronym,
      );
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('Acronym already exists');
      }
    }

    const unitOfMeasurement = await this.unitOfMeasurementRepository.update({
      id,
      name,
      acronym,
    });

    return { unitOfMeasurement };
  }
}

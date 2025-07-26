import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  UNIT_OF_MEASUREMENT_REPOSITORY,
  UnitOfMeasurementRepository,
} from '../repositories/unit-of-measurement.repository';
import { UpdateUnitOfMeasurementData } from '../repositories/@types';

@Injectable()
export class UpdateUnitOfMeasurementService {
  constructor(
    @Inject(UNIT_OF_MEASUREMENT_REPOSITORY)
    private readonly unitOfMeasurementRepository: UnitOfMeasurementRepository,
  ) {}

  async execute({ id, name, acronym }: UpdateUnitOfMeasurementData) {
    const checkIfUnitOfMeasurementExists =
      await this.unitOfMeasurementRepository.findById(id);
    if (!checkIfUnitOfMeasurementExists) {
      throw new NotFoundException('Unit of measurement does not exist');
    }

    if (acronym) {
      const checkIfRegistrationExists =
        await this.unitOfMeasurementRepository.findByAcronym(acronym);
      if (checkIfRegistrationExists) {
        throw new ConflictException('Registration already exists');
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

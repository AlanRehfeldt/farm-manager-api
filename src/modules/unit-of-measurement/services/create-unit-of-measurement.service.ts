import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { UomDimension } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { validateUomFields } from '../domain/validate-uom-fields';
import {
  UNIT_OF_MEASUREMENT_REPOSITORY,
  UnitOfMeasurementRepository,
} from '../repositories/unit-of-measurement.repository';

type CreateUnitOfMeasurementInput = {
  organizationId: string;
  name: string;
  acronym: string;
  dimension: UomDimension;
  isBase: boolean;
  factorToBase: string;
};

@Injectable()
export class CreateUnitOfMeasurementService {
  constructor(
    @Inject(UNIT_OF_MEASUREMENT_REPOSITORY)
    private readonly unitOfMeasurementRepository: UnitOfMeasurementRepository,
  ) {}

  async execute(input: CreateUnitOfMeasurementInput) {
    const checkIfAcronymExists =
      await this.unitOfMeasurementRepository.findByAcronym(
        input.organizationId,
        input.acronym,
      );
    if (checkIfAcronymExists) {
      throw new ConflictException('Acronym already exists');
    }

    const factorToBase = new Decimal(input.factorToBase);

    await validateUomFields(this.unitOfMeasurementRepository, {
      organizationId: input.organizationId,
      dimension: input.dimension,
      isBase: input.isBase,
      factorToBase,
    });

    const unitOfMeasurement = await this.unitOfMeasurementRepository.create({
      name: input.name,
      acronym: input.acronym,
      organizationId: input.organizationId,
      dimension: input.dimension,
      isBase: input.isBase,
      factorToBase,
    });

    return { unitOfMeasurement };
  }
}

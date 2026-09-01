import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { validateUomFields } from '../domain/validate-uom-fields';
import { UpdateUnitOfMeasurementData } from '../repositories/@types';
import {
  UNIT_OF_MEASUREMENT_REPOSITORY,
  UnitOfMeasurementRepository,
} from '../repositories/unit-of-measurement.repository';

type UpdateUnitOfMeasurementInput = Omit<
  UpdateUnitOfMeasurementData,
  'factorToBase'
> & {
  factorToBase?: string;
};

@Injectable()
export class UpdateUnitOfMeasurementService {
  constructor(
    @Inject(UNIT_OF_MEASUREMENT_REPOSITORY)
    private readonly unitOfMeasurementRepository: UnitOfMeasurementRepository,
  ) {}

  async execute(
    organizationId: string,
    {
      id,
      name,
      acronym,
      dimension,
      isBase,
      factorToBase,
    }: UpdateUnitOfMeasurementInput,
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

    const nextDimension = dimension ?? existing.dimension;
    const nextIsBase = isBase ?? existing.isBase;
    const nextFactorToBase =
      factorToBase != null ? new Decimal(factorToBase) : existing.factorToBase;

    await validateUomFields(this.unitOfMeasurementRepository, {
      organizationId,
      dimension: nextDimension,
      isBase: nextIsBase,
      factorToBase: nextFactorToBase,
      excludeId: id,
    });

    const unitOfMeasurement = await this.unitOfMeasurementRepository.update({
      id,
      name,
      acronym,
      dimension,
      isBase,
      factorToBase: factorToBase != null ? nextFactorToBase : undefined,
    });

    return { unitOfMeasurement };
  }
}

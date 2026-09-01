import { BadRequestException, ConflictException } from '@nestjs/common';
import { UomDimension } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { UnitOfMeasurementRepository } from '../repositories/unit-of-measurement.repository';

type ValidateUomFieldsInput = {
  organizationId: string;
  dimension: UomDimension;
  isBase: boolean;
  factorToBase: Decimal;
  excludeId?: string;
};

export async function validateUomFields(
  repository: UnitOfMeasurementRepository,
  input: ValidateUomFieldsInput,
): Promise<void> {
  if (input.factorToBase.lte(0)) {
    throw new BadRequestException('factorToBase must be greater than zero');
  }

  if (input.isBase) {
    if (!input.factorToBase.eq(1)) {
      throw new BadRequestException(
        'Base unit of measurement must have factorToBase equal to 1',
      );
    }

    const existingBase = await repository.findBaseByDimension(
      input.organizationId,
      input.dimension,
    );

    if (existingBase && existingBase.id !== input.excludeId) {
      throw new ConflictException(
        `A base unit already exists for dimension ${input.dimension}`,
      );
    }
  }
}

import { UnitOfMeasurement } from '@prisma/client';
import { decimalToString } from 'src/common/serialization/decimal';

export type UnitOfMeasurementResponse = {
  id: string;
  organizationId: string;
  name: string;
  acronym: string;
  dimension: UnitOfMeasurement['dimension'];
  isBase: boolean;
  factorToBase: string;
  createdAt: Date;
  updatedAt: Date;
};

export function toUnitOfMeasurementResponse(
  unitOfMeasurement: UnitOfMeasurement,
): UnitOfMeasurementResponse {
  return {
    id: unitOfMeasurement.id,
    organizationId: unitOfMeasurement.organizationId,
    name: unitOfMeasurement.name,
    acronym: unitOfMeasurement.acronym,
    dimension: unitOfMeasurement.dimension,
    isBase: unitOfMeasurement.isBase,
    factorToBase: decimalToString(unitOfMeasurement.factorToBase)!,
    createdAt: unitOfMeasurement.createdAt,
    updatedAt: unitOfMeasurement.updatedAt,
  };
}

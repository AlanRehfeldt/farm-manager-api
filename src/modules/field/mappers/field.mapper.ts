import { Field } from '@prisma/client';
import { decimalToString } from 'src/common/serialization/decimal';

export type FieldResponse = {
  id: string;
  farmId: string;
  name: string;
  areaHa: string;
  active: boolean;
  plantsPerHa: string | null;
  plantedYear: number | null;
  spacingNote: string | null;
  externalRef: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toFieldResponse(field: Field): FieldResponse {
  return {
    id: field.id,
    farmId: field.farmId,
    name: field.name,
    areaHa: decimalToString(field.areaHa)!,
    active: field.active,
    plantsPerHa: decimalToString(field.plantsPerHa),
    plantedYear: field.plantedYear,
    spacingNote: field.spacingNote,
    externalRef: field.externalRef,
    createdAt: field.createdAt,
    updatedAt: field.updatedAt,
  };
}

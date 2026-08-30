import { Variety } from '@prisma/client';

export type VarietyResponse = {
  id: string;
  cropId: string;
  name: string;
  externalRef: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toVarietyResponse(variety: Variety): VarietyResponse {
  return {
    id: variety.id,
    cropId: variety.cropId,
    name: variety.name,
    externalRef: variety.externalRef,
    createdAt: variety.createdAt,
    updatedAt: variety.updatedAt,
  };
}

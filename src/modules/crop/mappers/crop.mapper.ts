import { Crop } from '@prisma/client';

export type CropResponse = {
  id: string;
  organizationId: string;
  name: string;
  defaultProductionUomId: string | null;
  externalRef: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toCropResponse(crop: Crop): CropResponse {
  return {
    id: crop.id,
    organizationId: crop.organizationId,
    name: crop.name,
    defaultProductionUomId: crop.defaultProductionUomId,
    externalRef: crop.externalRef,
    createdAt: crop.createdAt,
    updatedAt: crop.updatedAt,
  };
}

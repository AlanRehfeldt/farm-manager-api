import { CropSeasonStatus } from '@prisma/client';
import { SeasonCostingResult } from '../domain/compute-season-costing';

export type SeasonCostingResponse = SeasonCostingResult & {
  cropSeasonId: string;
  status: CropSeasonStatus;
  source: 'LIVE' | 'SNAPSHOT';
  closedAt: string | null;
  productionUomId: string;
  productionUomAcronym: string;
  openLaborMonths: { year: number; month: number }[];
};

export function toSeasonCostingResponse(
  cropSeasonId: string,
  status: CropSeasonStatus,
  source: 'LIVE' | 'SNAPSHOT',
  productionUomId: string,
  productionUomAcronym: string,
  costing: SeasonCostingResult,
  closedAt: Date | null = null,
  openLaborMonths: { year: number; month: number }[] = [],
): SeasonCostingResponse {
  return {
    cropSeasonId,
    status,
    source,
    closedAt: closedAt?.toISOString() ?? null,
    productionUomId,
    productionUomAcronym,
    openLaborMonths,
    ...costing,
  };
}

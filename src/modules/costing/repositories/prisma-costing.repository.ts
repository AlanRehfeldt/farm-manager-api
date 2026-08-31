import { Injectable } from '@nestjs/common';
import { CropSeasonStatus } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  CloseSeasonData,
  CostEntryForCosting,
  CropSeasonCostingContext,
  FieldHarvestForCosting,
  PlantingForCosting,
  SeasonCostingSnapshotRecord,
  UpdateReferencePriceData,
} from './@types';
import { CostingRepository } from './costing.repository';

@Injectable()
export class PrismaCostingRepository implements CostingRepository {
  constructor(private prisma: PrismaService) {}

  async findSeasonContext(
    cropSeasonId: string,
    farmId: string,
  ): Promise<CropSeasonCostingContext | null> {
    const season = await this.prisma.cropSeason.findFirst({
      where: { id: cropSeasonId, farmId },
      include: {
        productionUom: { select: { id: true, acronym: true } },
      },
    });

    if (!season) {
      return null;
    }

    return {
      id: season.id,
      farmId: season.farmId,
      status: season.status,
      productionUomId: season.productionUomId,
      productionUomAcronym: season.productionUom.acronym,
      referenceSalePriceInCents: season.referenceSalePriceInCents,
    };
  }

  async findCostEntries(cropSeasonId: string): Promise<CostEntryForCosting[]> {
    const entries = await this.prisma.costEntry.findMany({
      where: { cropSeasonId },
      include: {
        costCategory: { select: { id: true, code: true, name: true } },
      },
    });

    return entries.map((entry) => ({
      fieldId: entry.fieldId,
      sourceType: entry.sourceType,
      costCategoryId: entry.costCategory.id,
      costCategoryCode: entry.costCategory.code,
      costCategoryName: entry.costCategory.name,
      amountInCents: entry.amountInCents,
    }));
  }

  async findPlantings(cropSeasonId: string): Promise<PlantingForCosting[]> {
    const plantings = await this.prisma.cropPlanting.findMany({
      where: { cropSeasonId },
      include: { field: { select: { id: true, name: true, areaHa: true } } },
    });

    return plantings.map((planting) => ({
      fieldId: planting.fieldId,
      fieldName: planting.field.name,
      areaHa: planting.plantedAreaHa ?? planting.field.areaHa,
    }));
  }

  async findFieldHarvests(
    farmId: string,
    cropSeasonId: string,
    productionUomId: string,
  ): Promise<FieldHarvestForCosting[]> {
    const items = await this.prisma.harvestItem.findMany({
      where: {
        uomId: productionUomId,
        harvest: { farmId, cropSeasonId },
      },
      select: {
        quantity: true,
        harvest: { select: { fieldId: true } },
      },
    });

    const byField = new Map<
      string,
      import('@prisma/client/runtime/library').Decimal
    >();

    for (const item of items) {
      const fieldId = item.harvest.fieldId;
      const current = byField.get(fieldId);
      if (current) {
        byField.set(fieldId, current.plus(item.quantity));
      } else {
        byField.set(fieldId, item.quantity);
      }
    }

    return [...byField.entries()].map(([fieldId, quantity]) => ({
      fieldId,
      quantity,
    }));
  }

  async findSnapshot(
    cropSeasonId: string,
  ): Promise<SeasonCostingSnapshotRecord | null> {
    const snapshot = await this.prisma.seasonCostingSnapshot.findUnique({
      where: { cropSeasonId },
    });

    if (!snapshot) {
      return null;
    }

    return {
      cropSeasonId: snapshot.cropSeasonId,
      payload: snapshot.payload as SeasonCostingSnapshotRecord['payload'],
      closedAt: snapshot.closedAt,
      closedByUserId: snapshot.closedByUserId,
    };
  }

  async closeSeason(data: CloseSeasonData): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.seasonCostingSnapshot.create({
        data: {
          cropSeasonId: data.cropSeasonId,
          payload: data.payload,
          closedAt: new Date(),
          closedByUserId: data.closedByUserId,
        },
      }),
      this.prisma.cropSeason.update({
        where: { id: data.cropSeasonId },
        data: { status: CropSeasonStatus.CLOSED },
      }),
    ]);
  }

  async updateReferencePrice(data: UpdateReferencePriceData): Promise<void> {
    await this.prisma.cropSeason.update({
      where: { id: data.cropSeasonId },
      data: { referenceSalePriceInCents: data.referenceSalePriceInCents },
    });
  }
}

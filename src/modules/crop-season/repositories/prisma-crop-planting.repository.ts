import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  CreateCropPlantingData,
  CropPlantingWithRelations,
  SearchManyCropPlantingsQuery,
  UpdateCropPlantingData,
} from './@types';
import { CropPlantingRepository } from './crop-planting.repository';

const plantingInclude = {
  field: true,
  variety: true,
} as const;

@Injectable()
export class PrismaCropPlantingRepository implements CropPlantingRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    data: CreateCropPlantingData,
  ): Promise<CropPlantingWithRelations> {
    return await this.prisma.cropPlanting.create({
      data,
      include: plantingInclude,
    });
  }

  async update(
    data: UpdateCropPlantingData,
  ): Promise<CropPlantingWithRelations> {
    const { id, ...rest } = data;
    return await this.prisma.cropPlanting.update({
      where: { id },
      data: rest,
      include: plantingInclude,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.cropPlanting.delete({ where: { id } });
  }

  async findById(
    id: string,
    farmId: string,
  ): Promise<CropPlantingWithRelations | null> {
    return await this.prisma.cropPlanting.findFirst({
      where: {
        id,
        cropSeason: { farmId },
      },
      include: plantingInclude,
    });
  }

  async findBySeasonAndField(
    cropSeasonId: string,
    fieldId: string,
  ): Promise<CropPlantingWithRelations | null> {
    return await this.prisma.cropPlanting.findFirst({
      where: { cropSeasonId, fieldId },
      include: plantingInclude,
    });
  }

  async findAllBySeason(
    cropSeasonId: string,
    farmId: string,
  ): Promise<CropPlantingWithRelations[]> {
    return await this.prisma.cropPlanting.findMany({
      where: {
        cropSeasonId,
        cropSeason: { farmId },
      },
      include: plantingInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  async countBySeasonId(cropSeasonId: string): Promise<number> {
    return await this.prisma.cropPlanting.count({
      where: { cropSeasonId },
    });
  }

  async hasFieldOperations(
    cropSeasonId: string,
    fieldId: string,
  ): Promise<boolean> {
    const [activities, harvests] = await Promise.all([
      this.prisma.activity.count({ where: { cropSeasonId, fieldId } }),
      this.prisma.harvest.count({ where: { cropSeasonId, fieldId } }),
    ]);

    return activities > 0 || harvests > 0;
  }

  async searchMany(
    query: SearchManyCropPlantingsQuery,
  ): Promise<CropPlantingWithRelations[]> {
    return await this.prisma.cropPlanting.findMany({
      where: {
        cropSeason: { farmId: query.farmId },
        id: query.id,
        cropSeasonId: query.cropSeasonId,
        fieldId: query.fieldId,
      },
      include: plantingInclude,
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: { [query.orderBy]: query.orderDirection },
    });
  }

  async count(query: SearchManyCropPlantingsQuery): Promise<number> {
    return await this.prisma.cropPlanting.count({
      where: {
        cropSeason: { farmId: query.farmId },
        id: query.id,
        cropSeasonId: query.cropSeasonId,
        fieldId: query.fieldId,
      },
    });
  }
}

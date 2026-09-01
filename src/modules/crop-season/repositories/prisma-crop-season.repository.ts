import { Injectable } from '@nestjs/common';
import { CropSeasonStatus } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  CreateCropSeasonData,
  CropSeasonWithCrop,
  SearchManyCropSeasonsQuery,
  UpdateCropSeasonData,
} from './@types';
import { CropSeasonRepository } from './crop-season.repository';

const cropInclude = {
  crop: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

@Injectable()
export class PrismaCropSeasonRepository implements CropSeasonRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCropSeasonData): Promise<CropSeasonWithCrop> {
    return await this.prisma.cropSeason.create({
      data,
      include: cropInclude,
    });
  }

  async update(data: UpdateCropSeasonData): Promise<CropSeasonWithCrop> {
    const { id, ...rest } = data;
    return await this.prisma.cropSeason.update({
      where: { id },
      data: rest,
      include: cropInclude,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.cropSeason.delete({ where: { id } });
  }

  async findById(
    id: string,
    farmId: string,
  ): Promise<CropSeasonWithCrop | null> {
    return await this.prisma.cropSeason.findFirst({
      where: { id, farmId },
      include: cropInclude,
    });
  }

  async updateStatus(
    id: string,
    status: CropSeasonStatus,
  ): Promise<CropSeasonWithCrop> {
    return await this.prisma.cropSeason.update({
      where: { id },
      data: { status },
      include: cropInclude,
    });
  }

  async countPlantings(cropSeasonId: string): Promise<number> {
    return await this.prisma.cropPlanting.count({
      where: { cropSeasonId },
    });
  }

  async hasOperationalData(cropSeasonId: string): Promise<boolean> {
    const [activities, costEntries, harvests, allocations] = await Promise.all([
      this.prisma.activity.count({ where: { cropSeasonId } }),
      this.prisma.costEntry.count({ where: { cropSeasonId } }),
      this.prisma.harvest.count({ where: { cropSeasonId } }),
      this.prisma.transactionAllocation.count({ where: { cropSeasonId } }),
    ]);

    return activities > 0 || costEntries > 0 || harvests > 0 || allocations > 0;
  }

  async countHarvests(cropSeasonId: string): Promise<number> {
    return await this.prisma.harvest.count({
      where: { cropSeasonId },
    });
  }

  async searchMany(
    query: SearchManyCropSeasonsQuery,
  ): Promise<CropSeasonWithCrop[]> {
    return await this.prisma.cropSeason.findMany({
      where: {
        farmId: query.farmId,
        id: query.id,
        status: query.status,
        cropId: query.cropId,
        name: query.name
          ? { contains: query.name, mode: 'insensitive' }
          : undefined,
      },
      include: cropInclude,
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: { [query.orderBy]: query.orderDirection },
    });
  }

  async count(query: SearchManyCropSeasonsQuery): Promise<number> {
    return await this.prisma.cropSeason.count({
      where: {
        farmId: query.farmId,
        id: query.id,
        status: query.status,
        cropId: query.cropId,
        name: query.name
          ? { contains: query.name, mode: 'insensitive' }
          : undefined,
      },
    });
  }
}

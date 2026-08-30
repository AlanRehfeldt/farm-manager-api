import { Injectable } from '@nestjs/common';
import { Crop } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  CreateCropData,
  SearchManyCropsQuery,
  UpdateCropData,
} from './@types';
import { CropRepository } from './crop.repository';

@Injectable()
export class PrismaCropRepository implements CropRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCropData): Promise<Crop> {
    return await this.prisma.crop.create({ data });
  }

  async update(data: UpdateCropData): Promise<Crop> {
    const { id, ...rest } = data;
    return await this.prisma.crop.update({
      where: { id },
      data: rest,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.crop.delete({ where: { id } });
  }

  async findById(id: string, organizationId: string): Promise<Crop | null> {
    return await this.prisma.crop.findFirst({
      where: { id, organizationId },
    });
  }

  async findByName(
    organizationId: string,
    name: string,
  ): Promise<Crop | null> {
    return await this.prisma.crop.findFirst({
      where: { organizationId, name },
    });
  }

  async searchMany(query: SearchManyCropsQuery): Promise<Crop[]> {
    return await this.prisma.crop.findMany({
      where: {
        organizationId: query.organizationId,
        id: query.id,
        name: query.name
          ? { contains: query.name, mode: 'insensitive' }
          : undefined,
      },
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: { [query.orderBy]: query.orderDirection },
    });
  }

  async count(query: SearchManyCropsQuery): Promise<number> {
    return await this.prisma.crop.count({
      where: {
        organizationId: query.organizationId,
        id: query.id,
        name: query.name
          ? { contains: query.name, mode: 'insensitive' }
          : undefined,
      },
    });
  }
}

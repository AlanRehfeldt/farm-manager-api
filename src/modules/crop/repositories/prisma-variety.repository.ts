import { Injectable } from '@nestjs/common';
import { Variety } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  CreateVarietyData,
  SearchManyVarietiesQuery,
  UpdateVarietyData,
} from './@types';
import { VarietyRepository } from './variety.repository';

@Injectable()
export class PrismaVarietyRepository implements VarietyRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateVarietyData): Promise<Variety> {
    return await this.prisma.variety.create({ data });
  }

  async update(data: UpdateVarietyData): Promise<Variety> {
    const { id, ...rest } = data;
    return await this.prisma.variety.update({
      where: { id },
      data: rest,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.variety.delete({ where: { id } });
  }

  async findById(id: string, organizationId: string): Promise<Variety | null> {
    return await this.prisma.variety.findFirst({
      where: { id, crop: { organizationId } },
    });
  }

  async findByName(cropId: string, name: string): Promise<Variety | null> {
    return await this.prisma.variety.findFirst({
      where: { cropId, name },
    });
  }

  async searchMany(query: SearchManyVarietiesQuery): Promise<Variety[]> {
    return await this.prisma.variety.findMany({
      where: {
        crop: { organizationId: query.organizationId },
        cropId: query.cropId,
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

  async count(query: SearchManyVarietiesQuery): Promise<number> {
    return await this.prisma.variety.count({
      where: {
        crop: { organizationId: query.organizationId },
        cropId: query.cropId,
        id: query.id,
        name: query.name
          ? { contains: query.name, mode: 'insensitive' }
          : undefined,
      },
    });
  }
}

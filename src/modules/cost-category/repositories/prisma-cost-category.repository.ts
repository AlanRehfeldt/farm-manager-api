import { Injectable } from '@nestjs/common';
import { CostCategory } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { SearchManyQuery } from './@types';
import { CostCategoryRepository } from './cost-category.repository';

@Injectable()
export class PrismaCostCategoryRepository implements CostCategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertSeed(
    organizationId: string,
    code: string,
    name: string,
  ): Promise<CostCategory> {
    return this.prisma.costCategory.upsert({
      where: {
        organizationId_code: {
          organizationId,
          code,
        },
      },
      create: {
        organizationId,
        code,
        name,
      },
      update: {
        name,
      },
    });
  }

  async findByCode(
    organizationId: string,
    code: string,
  ): Promise<CostCategory | null> {
    return this.prisma.costCategory.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code,
        },
      },
    });
  }

  async findById(
    id: string,
    organizationId: string,
  ): Promise<CostCategory | null> {
    return this.prisma.costCategory.findFirst({
      where: { id, organizationId },
    });
  }

  async searchMany(query: SearchManyQuery): Promise<CostCategory[]> {
    return this.prisma.costCategory.findMany({
      where: {
        organizationId: query.organizationId,
        id: query.id,
        name: query.name
          ? { contains: query.name, mode: 'insensitive' }
          : undefined,
        code: query.code
          ? { contains: query.code, mode: 'insensitive' }
          : undefined,
      },
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: { [query.orderBy]: query.orderDirection },
    });
  }

  async count(query: SearchManyQuery): Promise<number> {
    return this.prisma.costCategory.count({
      where: {
        organizationId: query.organizationId,
        id: query.id,
        name: query.name
          ? { contains: query.name, mode: 'insensitive' }
          : undefined,
        code: query.code
          ? { contains: query.code, mode: 'insensitive' }
          : undefined,
      },
    });
  }
}

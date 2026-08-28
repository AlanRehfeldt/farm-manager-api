import { Injectable } from '@nestjs/common';
import { Farm, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateFarmData, SearchManyQuery, UpdateFarmData } from './@types';
import { FarmRepository } from './farm.repository';

@Injectable()
export class PrismaFarmRepository implements FarmRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateFarmData): Promise<Farm> {
    return this.prisma.farm.create({ data });
  }

  async update(data: UpdateFarmData): Promise<Farm> {
    return this.prisma.farm.update({
      where: { id: data.id },
      data: {
        name: data.name,
        timezone: data.timezone,
      },
    });
  }

  async findById(id: string): Promise<Farm | null> {
    return this.prisma.farm.findUnique({ where: { id } });
  }

  async findByOrganizationAndName(
    organizationId: string,
    name: string,
  ): Promise<Farm | null> {
    return this.prisma.farm.findFirst({
      where: { organizationId, name },
    });
  }

  async findAccessibleByUser(id: string, userId: string): Promise<Farm | null> {
    return this.prisma.farm.findFirst({
      where: {
        id,
        OR: this.accessibleWhere(userId),
      },
    });
  }

  async searchAccessibleByUser(
    userId: string,
    query: SearchManyQuery,
  ): Promise<Farm[]> {
    return this.prisma.farm.findMany({
      where: this.searchWhere(userId, query),
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: { [query.orderBy]: query.orderDirection },
    });
  }

  async countAccessibleByUser(
    userId: string,
    query: SearchManyQuery,
  ): Promise<number> {
    return this.prisma.farm.count({
      where: this.searchWhere(userId, query),
    });
  }

  private accessibleWhere(userId: string): Prisma.FarmWhereInput[] {
    return [
      {
        organization: {
          memberships: { some: { userId, farmId: null } },
        },
      },
      { memberships: { some: { userId } } },
    ];
  }

  private searchWhere(
    userId: string,
    query: SearchManyQuery,
  ): Prisma.FarmWhereInput {
    return {
      OR: this.accessibleWhere(userId),
      organizationId: query.organizationId,
      name: query.name
        ? { contains: query.name, mode: 'insensitive' }
        : undefined,
    };
  }
}

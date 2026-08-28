import { Injectable } from '@nestjs/common';
import { CostCenter } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  CostCenterWithChildren,
  CreateCostCenterData,
  SearchManyQuery,
  UpdateCostCenterData,
} from './@types';
import { CostCenterRepository } from './cost-center.repository';

@Injectable()
export class PrismaCostCenterRepository implements CostCenterRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCostCenterData): Promise<CostCenter> {
    return await this.prisma.costCenter.create({
      data,
    });
  }

  async update(data: UpdateCostCenterData): Promise<CostCenter> {
    return await this.prisma.costCenter.update({
      where: {
        id: data.id,
      },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.costCenter.delete({
      where: {
        id,
      },
    });
  }

  async findById(
    id: string,
    organizationId: string,
  ): Promise<CostCenter | null> {
    return await this.prisma.costCenter.findFirst({
      where: {
        id,
        organizationId,
      },
    });
  }

  async findByCode(
    organizationId: string,
    code: string,
  ): Promise<CostCenter | null> {
    return await this.prisma.costCenter.findFirst({
      where: {
        organizationId,
        code,
      },
    });
  }

  async searchMany(params: SearchManyQuery): Promise<CostCenterWithChildren[]> {
    const {
      page,
      perPage,
      orderBy,
      orderDirection,
      organizationId,
      ...filters
    } = params;

    const filterClauses = Object.entries(filters)
      .map(([key, value]) => {
        if (value) {
          if (key === 'name' || key === 'description' || key === 'code') {
            return `LOWER(s."${key}") LIKE '%${value.toString().toLowerCase()}%'`;
          } else {
            return `s."${key}" = '${value}'`;
          }
        }
        return null;
      })
      .filter(Boolean);

    const whereClauses = [
      `s."organizationId" = '${organizationId}'`,
      ...filterClauses,
    ].join(' AND ');

    const query = `
    WITH RECURSIVE cost_center_ancestors AS (
      SELECT s."id", s."name", s."description", s."code", s."parentId", s."organizationId", s."createdAt", s."updatedAt"
      FROM cost_centers s
      WHERE ${whereClauses}
      UNION ALL
      SELECT s."id", s."name", s."description", s."code", s."parentId", s."organizationId", s."createdAt", s."updatedAt"
      FROM cost_centers s
      INNER JOIN cost_center_ancestors sa ON s."id" = sa."parentId"
      WHERE s."organizationId" = '${organizationId}'
    )
    SELECT DISTINCT "id", "name", "description", "code", "parentId", "organizationId", "createdAt", "updatedAt"
    FROM cost_center_ancestors
    ORDER BY "${orderBy}" ${orderDirection}
  `;

    const costCenters: CostCenterWithChildren[] =
      await this.prisma.$queryRawUnsafe(query);

    const constCenterMap: Record<string, CostCenterWithChildren> = {};

    costCenters.forEach((costCenter) => {
      costCenter.children = [];
      constCenterMap[costCenter.id] = costCenter;
    });

    const rootCostCenters: CostCenterWithChildren[] = [];

    costCenters.forEach((costCenter) => {
      if (costCenter.parentId) {
        const parent = constCenterMap[costCenter.parentId];
        if (parent) {
          parent.children.push(costCenter);
        }
      } else {
        rootCostCenters.push(costCenter);
      }
    });

    rootCostCenters.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (aValue instanceof Date && bValue instanceof Date) {
        return orderDirection === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return orderDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    const paginatedResults = rootCostCenters.slice(
      (page - 1) * perPage,
      page * perPage,
    );

    return paginatedResults;
  }

  async count(query: SearchManyQuery): Promise<number> {
    return await this.prisma.costCenter.count({
      where: {
        organizationId: query.organizationId,
        name: {
          contains: query.name,
          mode: 'insensitive',
        },
        description: {
          contains: query.description,
          mode: 'insensitive',
        },
        code: {
          contains: query.code,
          mode: 'insensitive',
        },
        parentId: query.parentId,
      },
    });
  }
}

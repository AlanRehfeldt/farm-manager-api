import { PrismaService } from 'src/common/prisma/prisma.service';
import { AccountPlanRepository } from './account-plan.repository';
import { AccountPlan } from '@prisma/client';
import {
  CreateAccountPlanData,
  UpdateAccountPlanData,
  SearchManyQuery,
  AccountPlanWithChildren,
} from './@types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaAccountPlanRepository implements AccountPlanRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAccountPlanData): Promise<AccountPlan> {
    return await this.prisma.accountPlan.create({
      data,
    });
  }

  async update(data: UpdateAccountPlanData): Promise<AccountPlan> {
    return await this.prisma.accountPlan.update({
      where: {
        id: data.id,
      },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.accountPlan.delete({
      where: {
        id,
      },
    });
  }

  async findById(id: string): Promise<AccountPlan | null> {
    return await this.prisma.accountPlan.findUnique({
      where: {
        id,
      },
    });
  }

  async findByCode(code: string): Promise<AccountPlan | null> {
    return await this.prisma.accountPlan.findFirst({
      where: {
        code,
      },
    });
  }

  async searchMany(
    params: SearchManyQuery,
  ): Promise<AccountPlanWithChildren[]> {
    const { page, perPage, orderBy, orderDirection, ...filters } = params;

    const whereClauses = Object.entries(filters)
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
      .filter(Boolean)
      .join(' AND ');

    const query = `
      WITH RECURSIVE account_plan_ancestors AS (
        SELECT s."id", s."name", s."description", s."code", s."parentId", s."createdAt", s."updatedAt"
        FROM account_plans s
        ${whereClauses ? `WHERE ${whereClauses}` : ''}
        UNION ALL
        SELECT s."id", s."name", s."description", s."code", s."parentId", s."createdAt", s."updatedAt"
        FROM account_plans s
        INNER JOIN account_plan_ancestors sa ON s."id" = sa."parentId"
      )
      SELECT DISTINCT "id", "name", "description", "code", "parentId", "createdAt", "updatedAt"
      FROM account_plan_ancestors
      ORDER BY "${orderBy}" ${orderDirection}
    `;

    const accountPlans: AccountPlanWithChildren[] =
      await this.prisma.$queryRawUnsafe(query);

    const accountPlanMap: Record<string, AccountPlanWithChildren> = {};

    accountPlans.forEach((accountPlan) => {
      accountPlan.children = [];
      accountPlanMap[accountPlan.id] = accountPlan;
    });

    const rootAccountPlans: AccountPlanWithChildren[] = [];

    accountPlans.forEach((accountPlan) => {
      if (accountPlan.parentId) {
        const parent = accountPlanMap[accountPlan.parentId];
        if (parent) {
          parent.children.push(accountPlan);
        }
      } else {
        rootAccountPlans.push(accountPlan);
      }
    });

    rootAccountPlans.sort((a, b) => {
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

    const paginatedResults = rootAccountPlans.slice(
      (page - 1) * perPage,
      page * perPage,
    );

    return paginatedResults;
  }

  async count(query: SearchManyQuery): Promise<number> {
    return await this.prisma.accountPlan.count({
      where: {
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

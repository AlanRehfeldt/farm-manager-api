import { PrismaService } from 'src/common/prisma/prisma.service';
import { AccountPlanRepository } from './account-plan.repository';
import { AccountPlan } from '@prisma/client';
import {
  CreateAccountPlanData,
  UpdateAccountPlanData,
  SearchManyQuery,
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

  async searchMany(query: SearchManyQuery): Promise<AccountPlan[]> {
    const orderBy = query.orderBy;
    const orderDirection = query.orderDirection;
    const page = query.page;
    const perPage = query.perPage;

    return await this.prisma.accountPlan.findMany({
      where: {
        name: {
          contains: query.name,
          mode: 'insensitive',
        },
        code: {
          contains: query.code,
          mode: 'insensitive',
        },
        type: query.type,
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: {
        [orderBy]: orderDirection,
      },
    });
  }

  async count(query: SearchManyQuery): Promise<number> {
    return await this.prisma.accountPlan.count({
      where: {
        name: {
          contains: query.name,
          mode: 'insensitive',
        },
        code: {
          contains: query.code,
          mode: 'insensitive',
        },
        type: query.type,
      },
    });
  }
}

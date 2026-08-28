import { Injectable } from '@nestjs/common';
import { Installment } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  CreateInstallmentData,
  SearchManyQuery,
  UpdateInstallmentData,
} from './@types';
import { InstallmentRepository } from './installment.repository';

@Injectable()
export class PrismaInstallmentRepository implements InstallmentRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateInstallmentData): Promise<Installment> {
    return await this.prisma.installment.create({
      data,
    });
  }

  async update(data: UpdateInstallmentData): Promise<Installment> {
    return await this.prisma.installment.update({
      where: {
        id: data.id,
      },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.installment.delete({
      where: {
        id,
      },
    });
  }

  async findById(id: string, farmId: string): Promise<Installment | null> {
    return await this.prisma.installment.findFirst({
      where: {
        id,
        transaction: { farmId },
      },
    });
  }

  async searchMany(query: SearchManyQuery): Promise<Installment[]> {
    return await this.prisma.installment.findMany({
      where: {
        transaction: { farmId: query.farmId },
        valueInCents: {
          gte: query.valueInCentsFrom,
          lte: query.valueInCentsTo,
        },
        dueDate: {
          gte: query.dueDateFrom,
          lte: query.dueDateTo,
        },
        paymentDate: {
          gte: query.paymentDateFrom,
          lte: query.paymentDateTo,
        },
        paymentForm: query.paymentForm,
        transactionId: query.transactionId,
        createdAt: {
          gte: query.createdAtFrom,
          lte: query.createdAtTo,
        },
        updatedAt: {
          gte: query.updatedAtFrom,
          lte: query.updatedAtTo,
        },
      },
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: {
        [query.orderBy]: query.orderDirection,
      },
    });
  }

  async count(query: SearchManyQuery): Promise<number> {
    return await this.prisma.installment.count({
      where: {
        transaction: { farmId: query.farmId },
        valueInCents: {
          gte: query.valueInCentsFrom,
          lte: query.valueInCentsTo,
        },
        dueDate: {
          gte: query.dueDateFrom,
          lte: query.dueDateTo,
        },
        paymentDate: {
          gte: query.paymentDateFrom,
          lte: query.paymentDateTo,
        },
        paymentForm: query.paymentForm,
        transactionId: query.transactionId,
        createdAt: {
          gte: query.createdAtFrom,
          lte: query.createdAtTo,
        },
        updatedAt: {
          gte: query.updatedAtFrom,
          lte: query.updatedAtTo,
        },
      },
    });
  }
}

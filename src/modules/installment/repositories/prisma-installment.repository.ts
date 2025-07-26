import { PrismaService } from 'src/common/prisma/prisma.service';
import { InstallmentRepository } from './installment.repository';
import { Installment } from '@prisma/client';
import {
  CreateInstallmentData,
  UpdateInstallmentData,
  SearchManyQuery,
} from './@types';
import { Injectable } from '@nestjs/common';

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

  async findById(id: string): Promise<Installment | null> {
    return await this.prisma.installment.findUnique({
      where: {
        id,
      },
    });
  }

  async searchMany(query: SearchManyQuery): Promise<Installment[]> {
    const orderBy = query.orderBy;
    const orderDirection = query.orderDirection;
    const page = query.page;
    const perPage = query.perPage;

    return await this.prisma.installment.findMany({
      where: {
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
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: {
        [orderBy]: orderDirection,
      },
    });
  }

  async count(query: SearchManyQuery): Promise<number> {
    return await this.prisma.installment.count({
      where: {
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

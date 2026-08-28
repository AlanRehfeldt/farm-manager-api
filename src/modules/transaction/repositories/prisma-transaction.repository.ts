import { Injectable } from '@nestjs/common';
import { Transaction } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  CreateTransactionData,
  SearchManyQuery,
  UpdateTransactionData,
} from './@types';
import { TransactionRepository } from './transaction.repository';

@Injectable()
export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateTransactionData): Promise<Transaction> {
    return await this.prisma.transaction.create({
      data,
    });
  }

  async update(data: UpdateTransactionData): Promise<Transaction> {
    return await this.prisma.transaction.update({
      where: {
        id: data.id,
      },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.transaction.delete({
      where: {
        id,
      },
    });
  }

  async findById(id: string, farmId: string): Promise<Transaction | null> {
    return await this.prisma.transaction.findFirst({
      where: {
        id,
        farmId,
      },
    });
  }

  async searchMany(query: SearchManyQuery): Promise<Transaction[]> {
    return await this.prisma.transaction.findMany({
      where: {
        farmId: query.farmId,
        type: query.type,
        date: {
          gte: query.dateFrom,
          lte: query.dateTo,
        },
        note: {
          contains: query.note,
          mode: 'insensitive',
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
    return await this.prisma.transaction.count({
      where: {
        farmId: query.farmId,
        type: query.type,
        date: {
          gte: query.dateFrom,
          lte: query.dateTo,
        },
        note: {
          contains: query.note,
          mode: 'insensitive',
        },
      },
    });
  }
}

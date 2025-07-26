import { PrismaService } from 'src/common/prisma/prisma.service';
import { TransactionRepository } from './transaction.repository';
import { Transaction } from '@prisma/client';
import {
  CreateTransactionData,
  UpdateTransactionData,
  SearchManyQuery,
} from './@types';
import { Injectable } from '@nestjs/common';

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

  async findById(id: string): Promise<Transaction | null> {
    return await this.prisma.transaction.findUnique({
      where: {
        id,
      },
    });
  }

  async searchMany(query: SearchManyQuery): Promise<Transaction[]> {
    const orderBy = query.orderBy;
    const orderDirection = query.orderDirection;
    const page = query.page;
    const perPage = query.perPage;

    return await this.prisma.transaction.findMany({
      where: {
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
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: {
        [orderBy]: orderDirection,
      },
    });
  }

  async count(query: SearchManyQuery): Promise<number> {
    return await this.prisma.transaction.count({
      where: {
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

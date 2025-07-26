import { PrismaService } from 'src/common/prisma/prisma.service';
import { ProductRepository } from './product.repository';
import { Product } from '@prisma/client';
import {
  CreateProductData,
  UpdateProductData,
  SearchManyQuery,
} from './@types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProductData): Promise<Product> {
    return await this.prisma.product.create({
      data,
    });
  }

  async update(data: UpdateProductData): Promise<Product> {
    return await this.prisma.product.update({
      where: {
        id: data.id,
      },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: {
        id,
      },
    });
  }

  async findById(id: string): Promise<Product | null> {
    return await this.prisma.product.findUnique({
      where: {
        id,
      },
    });
  }

  async searchMany(query: SearchManyQuery): Promise<Product[]> {
    const orderBy = query.orderBy;
    const orderDirection = query.orderDirection;
    const page = query.page;
    const perPage = query.perPage;

    return await this.prisma.product.findMany({
      where: {
        name: {
          contains: query.name,
          mode: 'insensitive',
        },
        description: {
          contains: query.description,
          mode: 'insensitive',
        },
        unitOfMeasurementId: query.unitOfMeasurementId,
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: {
        [orderBy]: orderDirection,
      },
    });
  }

  async count(query: SearchManyQuery): Promise<number> {
    return await this.prisma.product.count({
      where: {
        name: {
          contains: query.name,
          mode: 'insensitive',
        },
        description: {
          contains: query.description,
          mode: 'insensitive',
        },
        unitOfMeasurementId: query.unitOfMeasurementId,
      },
    });
  }
}

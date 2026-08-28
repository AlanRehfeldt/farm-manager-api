import { Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { catalogVisibilityWhere } from 'src/common/tenancy/catalog-visibility';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  CreateProductData,
  SearchManyQuery,
  UpdateProductData,
} from './@types';
import { ProductRepository } from './product.repository';

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

  async findById(
    id: string,
    organizationId: string,
    farmId: string,
  ): Promise<Product | null> {
    return await this.prisma.product.findFirst({
      where: {
        id,
        ...catalogVisibilityWhere(organizationId, farmId),
      },
    });
  }

  async searchMany(query: SearchManyQuery): Promise<Product[]> {
    return await this.prisma.product.findMany({
      where: {
        ...catalogVisibilityWhere(query.organizationId, query.farmId),
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
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: {
        [query.orderBy]: query.orderDirection,
      },
    });
  }

  async count(query: SearchManyQuery): Promise<number> {
    return await this.prisma.product.count({
      where: {
        ...catalogVisibilityWhere(query.organizationId, query.farmId),
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

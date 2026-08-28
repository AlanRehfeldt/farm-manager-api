import { Injectable } from '@nestjs/common';
import { Supplier } from '@prisma/client';
import { catalogVisibilityWhere } from 'src/common/tenancy/catalog-visibility';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  CreateSupplierData,
  SearchManyQuery,
  UpdateSupplierData,
} from './@types';
import { SupplierRepository } from './supplier.repository';

@Injectable()
export class PrismaSupplierRepository implements SupplierRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSupplierData): Promise<Supplier> {
    return await this.prisma.supplier.create({
      data,
    });
  }

  async update(data: UpdateSupplierData): Promise<Supplier> {
    return await this.prisma.supplier.update({
      where: {
        id: data.id,
      },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.supplier.delete({
      where: {
        id,
      },
    });
  }

  async findById(
    id: string,
    organizationId: string,
    farmId: string,
  ): Promise<Supplier | null> {
    return await this.prisma.supplier.findFirst({
      where: {
        id,
        ...catalogVisibilityWhere(organizationId, farmId),
      },
    });
  }

  async findByCnpj(
    organizationId: string,
    cnpj: string,
  ): Promise<Supplier | null> {
    return await this.prisma.supplier.findFirst({
      where: {
        organizationId,
        cnpj,
      },
    });
  }

  async searchMany(query: SearchManyQuery): Promise<Supplier[]> {
    return await this.prisma.supplier.findMany({
      where: {
        ...catalogVisibilityWhere(query.organizationId, query.farmId),
        name: {
          contains: query.name,
          mode: 'insensitive',
        },
        cnpj: {
          contains: query.cnpj,
          mode: 'insensitive',
        },
        address: {
          contains: query.address,
          mode: 'insensitive',
        },
        phoneNumber: {
          contains: query.phoneNumber,
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
    return await this.prisma.supplier.count({
      where: {
        ...catalogVisibilityWhere(query.organizationId, query.farmId),
        name: {
          contains: query.name,
          mode: 'insensitive',
        },
        cnpj: {
          contains: query.cnpj,
          mode: 'insensitive',
        },
        address: {
          contains: query.address,
          mode: 'insensitive',
        },
        phoneNumber: {
          contains: query.phoneNumber,
          mode: 'insensitive',
        },
      },
    });
  }
}

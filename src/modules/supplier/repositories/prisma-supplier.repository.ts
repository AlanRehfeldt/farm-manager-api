import { PrismaService } from 'src/common/prisma/prisma.service';
import { SupplierRepository } from './supplier.repository';
import { Supplier } from '@prisma/client';
import {
  CreateSupplierData,
  UpdateSupplierData,
  SearchManyQuery,
} from './@types';
import { Injectable } from '@nestjs/common';

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

  async findById(id: string): Promise<Supplier | null> {
    return await this.prisma.supplier.findUnique({
      where: {
        id,
      },
    });
  }

  async findByCnpj(cnpj: string): Promise<Supplier | null> {
    return await this.prisma.supplier.findUnique({
      where: {
        cnpj,
      },
    });
  }

  async searchMany(query: SearchManyQuery): Promise<Supplier[]> {
    const orderBy = query.orderBy;
    const orderDirection = query.orderDirection;
    const page = query.page;
    const perPage = query.perPage;

    return await this.prisma.supplier.findMany({
      where: {
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
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: {
        [orderBy]: orderDirection,
      },
    });
  }

  async count(query: SearchManyQuery): Promise<number> {
    return await this.prisma.supplier.count({
      where: {
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

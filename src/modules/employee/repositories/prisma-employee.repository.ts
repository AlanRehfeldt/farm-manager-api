import { Injectable } from '@nestjs/common';
import { Employee } from '@prisma/client';
import { catalogVisibilityWhere } from 'src/common/tenancy/catalog-visibility';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  CreateEmployeeData,
  SearchManyQuery,
  UpdateEmployeeData,
} from './@types';
import { EmployeeRepository } from './employee.repository';

@Injectable()
export class PrismaEmployeeRepository implements EmployeeRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEmployeeData): Promise<Employee> {
    return await this.prisma.employee.create({
      data,
    });
  }

  async update(data: UpdateEmployeeData): Promise<Employee> {
    return await this.prisma.employee.update({
      where: {
        id: data.id,
      },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.employee.delete({
      where: {
        id,
      },
    });
  }

  async findById(
    id: string,
    organizationId?: string,
    farmId?: string,
  ): Promise<Employee | null> {
    if (organizationId && farmId) {
      return await this.prisma.employee.findFirst({
        where: {
          id,
          ...catalogVisibilityWhere(organizationId, farmId),
        },
      });
    }

    return await this.prisma.employee.findFirst({
      where: { id },
    });
  }

  async findByRegistration(
    organizationId: string,
    registration: string,
  ): Promise<Employee | null> {
    return await this.prisma.employee.findFirst({
      where: {
        organizationId,
        registration,
      },
    });
  }

  async searchMany(query: SearchManyQuery): Promise<Employee[]> {
    return await this.prisma.employee.findMany({
      where: {
        ...catalogVisibilityWhere(query.organizationId, query.farmId),
        name: {
          contains: query.name,
          mode: 'insensitive',
        },
        registration: {
          contains: query.registration,
          mode: 'insensitive',
        },
        type: query.type,
      },
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: {
        [query.orderBy]: query.orderDirection,
      },
    });
  }

  async count(query: SearchManyQuery): Promise<number> {
    return await this.prisma.employee.count({
      where: {
        ...catalogVisibilityWhere(query.organizationId, query.farmId),
        name: {
          contains: query.name,
          mode: 'insensitive',
        },
        registration: {
          contains: query.registration,
          mode: 'insensitive',
        },
        type: query.type,
      },
    });
  }
}

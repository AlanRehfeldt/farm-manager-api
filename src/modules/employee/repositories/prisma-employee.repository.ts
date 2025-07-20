import { PrismaService } from 'src/common/prisma/prisma.service';
import { EmployeeRepository } from './employee.repository';
import { Employee } from '@prisma/client';
import {
  CreateEmployeeData,
  UpdateEmployeeData,
  SearchManyQuery,
} from './@types';
import { Injectable } from '@nestjs/common';

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

  async findById(id: string): Promise<Employee | null> {
    return await this.prisma.employee.findUnique({
      where: {
        id,
      },
    });
  }

  async findByRegistration(registration: string): Promise<Employee | null> {
    return await this.prisma.employee.findUnique({
      where: {
        registration,
      },
    });
  }

  async searchMany(query: SearchManyQuery): Promise<Employee[]> {
    const orderBy = query.orderBy;
    const orderDirection = query.orderDirection;
    const page = query.page;
    const perPage = query.perPage;

    return await this.prisma.employee.findMany({
      where: {
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
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: {
        [orderBy]: orderDirection,
      },
    });
  }

  async count(query: SearchManyQuery): Promise<number> {
    return await this.prisma.employee.count({
      where: {
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

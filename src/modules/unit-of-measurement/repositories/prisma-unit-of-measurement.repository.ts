import { PrismaService } from 'src/common/prisma/prisma.service';
import { UnitOfMeasurementRepository } from './unit-of-measurement.repository';
import { UnitOfMeasurement } from '@prisma/client';
import {
  CreateUnitOfMeasurementData,
  UpdateUnitOfMeasurementData,
  SearchManyQuery,
} from './@types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaUnitOfMeasurementRepository
  implements UnitOfMeasurementRepository
{
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUnitOfMeasurementData): Promise<UnitOfMeasurement> {
    return await this.prisma.unitOfMeasurement.create({
      data,
    });
  }

  async update(data: UpdateUnitOfMeasurementData): Promise<UnitOfMeasurement> {
    return await this.prisma.unitOfMeasurement.update({
      where: {
        id: data.id,
      },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.unitOfMeasurement.delete({
      where: {
        id,
      },
    });
  }

  async findById(id: string): Promise<UnitOfMeasurement | null> {
    return await this.prisma.unitOfMeasurement.findUnique({
      where: {
        id,
      },
    });
  }

  async findByAcronym(acronym: string): Promise<UnitOfMeasurement | null> {
    return await this.prisma.unitOfMeasurement.findUnique({
      where: {
        acronym,
      },
    });
  }

  async searchMany(query: SearchManyQuery): Promise<UnitOfMeasurement[]> {
    const orderBy = query.orderBy;
    const orderDirection = query.orderDirection;
    const page = query.page;
    const perPage = query.perPage;

    return await this.prisma.unitOfMeasurement.findMany({
      where: {
        name: {
          contains: query.name,
          mode: 'insensitive',
        },
        acronym: {
          contains: query.acronym,
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
    return await this.prisma.unitOfMeasurement.count({
      where: {
        name: {
          contains: query.name,
          mode: 'insensitive',
        },
        acronym: {
          contains: query.acronym,
          mode: 'insensitive',
        },
      },
    });
  }
}

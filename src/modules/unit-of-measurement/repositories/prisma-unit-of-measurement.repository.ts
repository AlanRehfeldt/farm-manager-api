import { Injectable } from '@nestjs/common';
import { UnitOfMeasurement, UomDimension } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  CreateUnitOfMeasurementData,
  SearchManyQuery,
  UpdateUnitOfMeasurementData,
} from './@types';
import { UnitOfMeasurementRepository } from './unit-of-measurement.repository';

@Injectable()
export class PrismaUnitOfMeasurementRepository implements UnitOfMeasurementRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUnitOfMeasurementData): Promise<UnitOfMeasurement> {
    return await this.prisma.unitOfMeasurement.create({ data });
  }

  async update(data: UpdateUnitOfMeasurementData): Promise<UnitOfMeasurement> {
    return await this.prisma.unitOfMeasurement.update({
      where: { id: data.id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.unitOfMeasurement.delete({ where: { id } });
  }

  async findById(
    id: string,
    organizationId: string,
  ): Promise<UnitOfMeasurement | null> {
    return await this.prisma.unitOfMeasurement.findFirst({
      where: { id, organizationId },
    });
  }

  async findByAcronym(
    organizationId: string,
    acronym: string,
  ): Promise<UnitOfMeasurement | null> {
    return await this.prisma.unitOfMeasurement.findFirst({
      where: { organizationId, acronym },
    });
  }

  async findBaseByDimension(
    organizationId: string,
    dimension: UomDimension,
  ): Promise<UnitOfMeasurement | null> {
    return await this.prisma.unitOfMeasurement.findFirst({
      where: { organizationId, dimension, isBase: true },
    });
  }

  async searchMany(query: SearchManyQuery): Promise<UnitOfMeasurement[]> {
    return await this.prisma.unitOfMeasurement.findMany({
      where: {
        organizationId: query.organizationId,
        name: { contains: query.name, mode: 'insensitive' },
        acronym: { contains: query.acronym, mode: 'insensitive' },
      },
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: { [query.orderBy]: query.orderDirection },
    });
  }

  async count(query: SearchManyQuery): Promise<number> {
    return await this.prisma.unitOfMeasurement.count({
      where: {
        organizationId: query.organizationId,
        name: { contains: query.name, mode: 'insensitive' },
        acronym: { contains: query.acronym, mode: 'insensitive' },
      },
    });
  }
}

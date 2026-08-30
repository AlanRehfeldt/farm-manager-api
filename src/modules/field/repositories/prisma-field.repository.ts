import { Injectable } from '@nestjs/common';
import { Field } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateFieldData, SearchManyQuery, UpdateFieldData } from './@types';
import { FieldRepository } from './field.repository';

@Injectable()
export class PrismaFieldRepository implements FieldRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateFieldData): Promise<Field> {
    return await this.prisma.field.create({ data });
  }

  async update(data: UpdateFieldData): Promise<Field> {
    const { id, ...rest } = data;
    return await this.prisma.field.update({
      where: { id },
      data: rest,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.field.delete({ where: { id } });
  }

  async findById(id: string, farmId: string): Promise<Field | null> {
    return await this.prisma.field.findFirst({
      where: { id, farmId },
    });
  }

  async findByName(farmId: string, name: string): Promise<Field | null> {
    return await this.prisma.field.findFirst({
      where: { farmId, name },
    });
  }

  async searchMany(query: SearchManyQuery): Promise<Field[]> {
    return await this.prisma.field.findMany({
      where: {
        farmId: query.farmId,
        id: query.id,
        active: query.active,
        name: query.name
          ? { contains: query.name, mode: 'insensitive' }
          : undefined,
      },
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: { [query.orderBy]: query.orderDirection },
    });
  }

  async count(query: SearchManyQuery): Promise<number> {
    return await this.prisma.field.count({
      where: {
        farmId: query.farmId,
        id: query.id,
        active: query.active,
        name: query.name
          ? { contains: query.name, mode: 'insensitive' }
          : undefined,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { Machine } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  CreateMachineData,
  SearchManyQuery,
  UpdateMachineData,
} from './@types';
import { MachineRepository } from './machine.repository';

@Injectable()
export class PrismaMachineRepository implements MachineRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateMachineData): Promise<Machine> {
    return await this.prisma.machine.create({ data });
  }

  async update(data: UpdateMachineData): Promise<Machine> {
    const { id, ...rest } = data;
    return await this.prisma.machine.update({
      where: { id },
      data: rest,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.machine.delete({ where: { id } });
  }

  async findById(id: string, farmId: string): Promise<Machine | null> {
    return await this.prisma.machine.findFirst({
      where: { id, farmId },
    });
  }

  async findByName(farmId: string, name: string): Promise<Machine | null> {
    return await this.prisma.machine.findFirst({
      where: { farmId, name },
    });
  }

  async searchMany(query: SearchManyQuery): Promise<Machine[]> {
    return await this.prisma.machine.findMany({
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
    return await this.prisma.machine.count({
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

import { PrismaService } from 'src/common/prisma/prisma.service';
import { UserRepository } from './user.repository';
import { Prisma, User } from '@prisma/client';
import { SearchManyQuery, UpdateUserData } from './@types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({
      data,
    });
  }

  async update(data: UpdateUserData): Promise<User> {
    return await this.prisma.user.update({
      where: {
        id: data.id,
      },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async searchMany(query: SearchManyQuery): Promise<User[]> {
    const orderBy = query.orderBy;
    const orderDirection = query.orderDirection;
    const page = query.page;
    const perPage = query.perPage;

    return await this.prisma.user.findMany({
      where: {
        id: query.id,
        role: query.role,
        employeeId: query.employeeId,
        name: {
          contains: query.name,
          mode: 'insensitive',
        },
        email: {
          contains: query.email,
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
    return await this.prisma.user.count({
      where: {
        id: query.id,
        role: query.role,
        employeeId: query.employeeId,
        name: {
          contains: query.name,
          mode: 'insensitive',
        },
        email: {
          contains: query.email,
          mode: 'insensitive',
        },
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { Membership, Role } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  CreateMembershipData,
  MembershipWithUser,
  SearchManyQuery,
} from './@types';
import { MembershipRepository } from './membership.repository';

@Injectable()
export class PrismaMembershipRepository implements MembershipRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMembershipData): Promise<Membership> {
    return this.prisma.membership.create({
      data: {
        userId: data.userId,
        organizationId: data.organizationId,
        farmId: data.farmId ?? null,
        role: data.role,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.membership.delete({ where: { id } });
  }

  async findById(id: string): Promise<Membership | null> {
    return this.prisma.membership.findUnique({ where: { id } });
  }

  async findOrgAdmin(
    userId: string,
    organizationId: string,
  ): Promise<Membership | null> {
    return this.prisma.membership.findFirst({
      where: {
        userId,
        organizationId,
        role: Role.ADMIN,
        farmId: null,
      },
    });
  }

  async findByUserAndOrgAndFarm(
    userId: string,
    organizationId: string,
    farmId: string | null,
  ): Promise<Membership | null> {
    return this.prisma.membership.findFirst({
      where: {
        userId,
        organizationId,
        farmId,
      },
    });
  }

  async findManyByUser(userId: string): Promise<Membership[]> {
    return this.prisma.membership.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async searchMany(query: SearchManyQuery): Promise<MembershipWithUser[]> {
    return this.prisma.membership.findMany({
      where: {
        organizationId: query.organizationId,
        farmId: query.farmId,
        userId: query.userId,
        role: query.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: { [query.orderBy]: query.orderDirection },
    });
  }

  async count(query: SearchManyQuery): Promise<number> {
    return this.prisma.membership.count({
      where: {
        organizationId: query.organizationId,
        farmId: query.farmId,
        userId: query.userId,
        role: query.role,
      },
    });
  }

  async countOrgAdmins(organizationId: string): Promise<number> {
    return this.prisma.membership.count({
      where: {
        organizationId,
        role: Role.ADMIN,
      },
    });
  }
}

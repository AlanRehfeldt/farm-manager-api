import { Injectable } from '@nestjs/common';
import { Organization, Role } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { OrganizationRepository } from './organization.repository';
import {
  CreateOrganizationData,
  SearchManyQuery,
  UpdateOrganizationData,
} from './@types';

@Injectable()
export class PrismaOrganizationRepository implements OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createWithOwner(data: CreateOrganizationData): Promise<Organization> {
    return this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { name: data.name },
      });

      await tx.membership.create({
        data: {
          userId: data.ownerUserId,
          organizationId: organization.id,
          farmId: null,
          role: Role.ADMIN,
        },
      });

      return organization;
    });
  }

  async update(data: UpdateOrganizationData): Promise<Organization> {
    return this.prisma.organization.update({
      where: { id: data.id },
      data: { name: data.name },
    });
  }

  async findByIdForUser(
    id: string,
    userId: string,
  ): Promise<Organization | null> {
    return this.prisma.organization.findFirst({
      where: {
        id,
        memberships: { some: { userId } },
      },
    });
  }

  async searchManyForUser(
    userId: string,
    query: SearchManyQuery,
  ): Promise<Organization[]> {
    return this.prisma.organization.findMany({
      where: {
        memberships: { some: { userId } },
        name: query.name
          ? { contains: query.name, mode: 'insensitive' }
          : undefined,
      },
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: { [query.orderBy]: query.orderDirection },
    });
  }

  async countForUser(userId: string, query: SearchManyQuery): Promise<number> {
    return this.prisma.organization.count({
      where: {
        memberships: { some: { userId } },
        name: query.name
          ? { contains: query.name, mode: 'insensitive' }
          : undefined,
      },
    });
  }
}

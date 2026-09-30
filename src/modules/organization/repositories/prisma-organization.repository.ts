import { Injectable } from '@nestjs/common';
import { Organization, OrganizationStatus } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { OrganizationRepository } from './organization.repository';
import { SearchManyQuery, UpdateOrganizationData } from './@types';

@Injectable()
export class PrismaOrganizationRepository implements OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async update(data: UpdateOrganizationData): Promise<Organization> {
    const { id, ...fields } = data;
    return this.prisma.organization.update({
      where: { id },
      data: fields,
    });
  }

  async findByIdForUser(
    id: string,
    userId: string,
  ): Promise<Organization | null> {
    return this.prisma.organization.findFirst({
      where: {
        id,
        status: OrganizationStatus.ACTIVE,
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
        id: query.id,
        status: OrganizationStatus.ACTIVE,
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
        id: query.id,
        status: OrganizationStatus.ACTIVE,
        memberships: { some: { userId } },
        name: query.name
          ? { contains: query.name, mode: 'insensitive' }
          : undefined,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { Membership, PlatformRole, Role } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  CreateMembershipData,
  CreateUserWithMembershipsData,
  CreateUserWithMembershipsResult,
  MembershipWithUser,
  ReplaceProfileAndMembershipsData,
  SearchManyQuery,
} from './@types';
import { MembershipRepository } from './membership.repository';

const tenantUserWhere = {
  user: { platformRole: PlatformRole.NONE },
};

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

  async createMany(data: CreateMembershipData[]): Promise<Membership[]> {
    return this.prisma.$transaction(
      data.map((row) =>
        this.prisma.membership.create({
          data: {
            userId: row.userId,
            organizationId: row.organizationId,
            farmId: row.farmId ?? null,
            role: row.role,
          },
        }),
      ),
    );
  }

  async createUserWithMemberships(
    user: CreateUserWithMembershipsData,
    memberships: Omit<CreateMembershipData, 'userId'>[],
  ): Promise<CreateUserWithMembershipsResult> {
    return this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        },
      });

      const created: Membership[] = [];
      for (const row of memberships) {
        created.push(
          await tx.membership.create({
            data: {
              userId: createdUser.id,
              organizationId: row.organizationId,
              farmId: row.farmId ?? null,
              role: row.role,
            },
          }),
        );
      }

      return { userId: createdUser.id, memberships: created };
    });
  }

  async deleteManyByUserAndOrg(
    userId: string,
    organizationId: string,
  ): Promise<void> {
    await this.prisma.membership.deleteMany({
      where: { userId, organizationId },
    });
  }

  async replaceProfileAndMemberships(
    data: ReplaceProfileAndMembershipsData,
  ): Promise<Membership[]> {
    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: data.userId },
        data: {
          name: data.name,
          email: data.email,
        },
      });

      await tx.membership.deleteMany({
        where: {
          userId: data.userId,
          organizationId: data.organizationId,
        },
      });

      const created: Membership[] = [];
      for (const row of data.memberships) {
        created.push(
          await tx.membership.create({
            data: {
              userId: row.userId,
              organizationId: row.organizationId,
              farmId: row.farmId ?? null,
              role: row.role,
            },
          }),
        );
      }

      return created;
    });
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

  async findManyByUserAndOrg(
    userId: string,
    organizationId: string,
  ): Promise<Membership[]> {
    return this.prisma.membership.findMany({
      where: { userId, organizationId },
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
        ...tenantUserWhere,
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
        ...tenantUserWhere,
      },
    });
  }

  async countOrgAdmins(organizationId: string): Promise<number> {
    return this.prisma.membership.count({
      where: {
        organizationId,
        role: Role.ADMIN,
        farmId: null,
        user: { platformRole: PlatformRole.NONE },
      },
    });
  }
}

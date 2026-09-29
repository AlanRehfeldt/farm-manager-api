import { ConflictException, Injectable } from '@nestjs/common';
import {
  Membership,
  OrganizationStatus,
  PlatformRole,
  Prisma,
  Role,
} from '@prisma/client';
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

const activeOrganizationWhere = {
  organization: { status: OrganizationStatus.ACTIVE },
};

/**
 * Trava as memberships de admin org-wide antes de qualquer update de usuário.
 * A ordem estável é `userId`, para dois rebaixamentos concorrentes serializarem.
 */
async function lockOrgAdminMemberships(
  tx: Prisma.TransactionClient,
  organizationId: string,
): Promise<number> {
  const rows = await tx.$queryRaw<Array<{ id: string }>>`
    SELECT m.id
    FROM memberships m
    INNER JOIN users u ON u.id = m."userId"
    WHERE m."organizationId" = ${organizationId}
      AND m.role = 'ADMIN'::"Role"
      AND m."farmId" IS NULL
      AND u."platformRole" = 'NONE'::"PlatformRole"
    ORDER BY m."userId"
    FOR UPDATE OF m
  `;

  return rows.length;
}

async function assertOrgKeepsAnotherAdmin(
  tx: Prisma.TransactionClient,
  organizationId: string,
): Promise<void> {
  const adminCount = await lockOrgAdminMemberships(tx, organizationId);
  if (adminCount <= 1) {
    throw new ConflictException(
      'Cannot remove the last admin of the organization',
    );
  }
}

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
    options?: { guardLastOrgAdmin?: boolean },
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      if (options?.guardLastOrgAdmin) {
        await assertOrgKeepsAnotherAdmin(tx, organizationId);
      }

      await tx.membership.deleteMany({
        where: { userId, organizationId },
      });
    });
  }

  async replaceProfileAndMemberships(
    data: ReplaceProfileAndMembershipsData,
  ): Promise<Membership[]> {
    return this.prisma.$transaction(async (tx) => {
      if (data.guardLastOrgAdmin) {
        await assertOrgKeepsAnotherAdmin(tx, data.organizationId);
      }

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
        ...activeOrganizationWhere,
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
        ...activeOrganizationWhere,
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
        ...activeOrganizationWhere,
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

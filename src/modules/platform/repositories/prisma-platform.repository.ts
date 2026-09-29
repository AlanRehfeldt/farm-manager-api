import { Injectable } from '@nestjs/common';
import {
  Farm,
  Organization,
  OrganizationStatus,
  PlatformRole,
  Prisma,
  Role,
} from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  PlatformOrganizationListItem,
  PlatformUserListItem,
  ProvisionOrganizationData,
  ProvisionOrganizationResult,
  SearchPlatformOrganizationFarmsQuery,
  SearchPlatformOrganizationsQuery,
  SearchPlatformUsersQuery,
  SearchAuditLogsQuery,
  SearchSupportAccessQuery,
  SearchSupportUsersQuery,
  SupportAccessListItem,
  SupportUserListItem,
  ActiveSupportAccess,
  AuditLogListItem,
} from './@types';
import { PlatformRepository } from './platform.repository';
import {
  appendPlatformAuditLog,
  PlatformAuditAction,
} from './append-platform-audit-log';

@Injectable()
export class PrismaPlatformRepository implements PlatformRepository {
  constructor(private readonly prisma: PrismaService) {}

  async provisionOrganization(
    data: ProvisionOrganizationData,
    actorUserId: string,
  ): Promise<ProvisionOrganizationResult> {
    return this.prisma.$transaction(async (tx) => {
      const admin = await tx.user.create({
        data: {
          name: data.admin.name,
          email: data.admin.email,
          password: data.admin.passwordHash,
          platformRole: PlatformRole.NONE,
          mustChangePassword: true,
        },
      });

      const organization = await tx.organization.create({
        data: { name: data.organizationName },
      });

      await tx.membership.create({
        data: {
          userId: admin.id,
          organizationId: organization.id,
          farmId: null,
          role: Role.ADMIN,
        },
      });

      const farm = await tx.farm.create({
        data: {
          organizationId: organization.id,
          name: data.farmName,
          timezone: data.timezone,
        },
      });

      await appendPlatformAuditLog(tx, {
        actorUserId,
        action: PlatformAuditAction.ORGANIZATION_CREATED,
        targetType: 'Organization',
        targetId: organization.id,
        organizationId: organization.id,
      });

      return {
        organization,
        farm,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          platformRole: admin.platformRole,
          mustChangePassword: admin.mustChangePassword,
          createdAt: admin.createdAt,
          updatedAt: admin.updatedAt,
        },
      };
    });
  }

  async findOrganizationById(id: string): Promise<Organization | null> {
    return this.prisma.organization.findUnique({ where: { id } });
  }

  async updateOrganizationStatus(
    organizationId: string,
    status: OrganizationStatus,
    actorUserId: string,
  ): Promise<Organization | null> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.organization.findUnique({
        where: { id: organizationId },
        select: { id: true },
      });

      if (!existing) {
        return null;
      }

      const organization = await tx.organization.update({
        where: { id: organizationId },
        data: { status },
      });

      await appendPlatformAuditLog(tx, {
        actorUserId,
        action: PlatformAuditAction.ORGANIZATION_STATUS_UPDATED,
        targetType: 'Organization',
        targetId: organization.id,
        organizationId: organization.id,
        metadata: { status },
      });

      if (status !== OrganizationStatus.SUSPENDED) {
        return organization;
      }

      const memberships = await tx.membership.findMany({
        where: { organizationId },
        select: {
          userId: true,
          user: {
            select: {
              platformRole: true,
              memberships: {
                select: {
                  organization: { select: { status: true } },
                },
              },
            },
          },
        },
      });

      const userIds = [
        ...new Set(
          memberships
            .filter(
              (membership) =>
                membership.user.platformRole !== PlatformRole.PLATFORM_ADMIN,
            )
            .filter((membership) =>
              membership.user.memberships.every(
                (row) =>
                  row.organization.status === OrganizationStatus.SUSPENDED,
              ),
            )
            .map((membership) => membership.userId),
        ),
      ];

      if (userIds.length > 0) {
        await tx.refreshToken.updateMany({
          where: { userId: { in: userIds }, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }

      return organization;
    });
  }

  async searchOrganizationFarms(
    query: SearchPlatformOrganizationFarmsQuery,
  ): Promise<Farm[]> {
    return this.prisma.farm.findMany({
      where: this.organizationFarmWhere(query),
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: { [query.orderBy]: query.orderDirection },
    });
  }

  async countOrganizationFarms(
    query: SearchPlatformOrganizationFarmsQuery,
  ): Promise<number> {
    return this.prisma.farm.count({
      where: this.organizationFarmWhere(query),
    });
  }

  async searchOrganizations(
    query: SearchPlatformOrganizationsQuery,
  ): Promise<PlatformOrganizationListItem[]> {
    const organizations = await this.prisma.organization.findMany({
      where: this.organizationWhere(query),
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: { [query.orderBy]: query.orderDirection },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { farms: true } },
        farms: {
          select: {
            _count: {
              select: {
                cropSeasons: true,
                transactions: true,
                activities: true,
                harvests: true,
              },
            },
          },
        },
      },
    });

    const lastAccess = await this.lastAccessByOrganization(
      organizations.map((organization) => organization.id),
    );

    return organizations.map((organization) => {
      let seasonCount = 0;
      let entryCount = 0;

      for (const farm of organization.farms) {
        seasonCount += farm._count.cropSeasons;
        entryCount +=
          farm._count.transactions +
          farm._count.activities +
          farm._count.harvests;
      }

      return {
        id: organization.id,
        name: organization.name,
        status: organization.status,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
        farmCount: organization._count.farms,
        seasonCount,
        entryCount,
        lastAccessAt: lastAccess.get(organization.id) ?? null,
      };
    });
  }

  async countOrganizations(
    query: SearchPlatformOrganizationsQuery,
  ): Promise<number> {
    return this.prisma.organization.count({
      where: this.organizationWhere(query),
    });
  }

  async searchUsers(
    query: SearchPlatformUsersQuery,
  ): Promise<PlatformUserListItem[]> {
    const users = await this.prisma.user.findMany({
      where: this.userWhere(query),
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: { [query.orderBy]: query.orderDirection },
      select: {
        id: true,
        name: true,
        email: true,
        platformRole: true,
        mustChangePassword: true,
        employeeId: true,
        createdAt: true,
        updatedAt: true,
        memberships: {
          select: {
            id: true,
            organizationId: true,
            role: true,
            farmId: true,
          },
        },
      },
    });

    return users;
  }

  async countUsers(query: SearchPlatformUsersQuery): Promise<number> {
    return this.prisma.user.count({ where: this.userWhere(query) });
  }

  async resetUserPassword(
    userId: string,
    passwordHash: string,
    actorUserId: string,
  ): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!existing) {
        return false;
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          password: passwordHash,
          mustChangePassword: true,
          passwordChangedAt: new Date(),
        },
      });

      await tx.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      await appendPlatformAuditLog(tx, {
        actorUserId,
        action: PlatformAuditAction.USER_PASSWORD_RESET,
        targetType: 'User',
        targetId: userId,
      });

      return true;
    });
  }

  async createSupportUser(data: {
    name: string;
    email: string;
    passwordHash: string;
    actorUserId: string;
  }): Promise<SupportUserListItem> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.passwordHash,
          platformRole: PlatformRole.PLATFORM_SUPPORT,
          mustChangePassword: true,
        },
      });

      await appendPlatformAuditLog(tx, {
        actorUserId: data.actorUserId,
        action: PlatformAuditAction.SUPPORT_USER_CREATED,
        targetType: 'User',
        targetId: user.id,
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        mustChangePassword: user.mustChangePassword,
        createdAt: user.createdAt,
      };
    });
  }

  async grantSupportAccess(data: {
    userId: string;
    organizationId: string;
    grantedByUserId: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const access = await tx.supportAccess.create({
        data: {
          userId: data.userId,
          organizationId: data.organizationId,
          grantedByUserId: data.grantedByUserId,
        },
      });

      await appendPlatformAuditLog(tx, {
        actorUserId: data.grantedByUserId,
        action: PlatformAuditAction.SUPPORT_ACCESS_GRANTED,
        targetType: 'SupportAccess',
        targetId: access.id,
        organizationId: data.organizationId,
        metadata: { userId: data.userId },
      });

      return access;
    });
  }

  async revokeSupportAccess(id: string, actorUserId: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.supportAccess.findUnique({ where: { id } });

      if (!existing || existing.revokedAt) {
        return null;
      }

      const access = await tx.supportAccess.update({
        where: { id },
        data: { revokedAt: new Date() },
      });

      await appendPlatformAuditLog(tx, {
        actorUserId,
        action: PlatformAuditAction.SUPPORT_ACCESS_REVOKED,
        targetType: 'SupportAccess',
        targetId: access.id,
        organizationId: access.organizationId,
        metadata: { userId: access.userId },
      });

      return access;
    });
  }

  async searchSupportAccess(
    query: SearchSupportAccessQuery,
  ): Promise<SupportAccessListItem[]> {
    const rows = await this.prisma.supportAccess.findMany({
      where: this.activeSupportAccessWhere(query),
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: { createdAt: query.orderDirection },
      include: {
        user: { select: { name: true, email: true } },
        organization: { select: { name: true } },
        grantedBy: { select: { name: true } },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      userName: row.user.name,
      userEmail: row.user.email,
      organizationId: row.organizationId,
      organizationName: row.organization.name,
      grantedByUserId: row.grantedByUserId,
      grantedByName: row.grantedBy.name,
      createdAt: row.createdAt,
    }));
  }

  async countSupportAccess(query: SearchSupportAccessQuery): Promise<number> {
    return this.prisma.supportAccess.count({
      where: this.activeSupportAccessWhere(query),
    });
  }

  async listActiveSupportAccess(userId: string): Promise<ActiveSupportAccess[]> {
    const rows = await this.prisma.supportAccess.findMany({
      where: {
        userId,
        revokedAt: null,
        organization: { status: OrganizationStatus.ACTIVE },
      },
      orderBy: { organization: { name: 'asc' } },
      select: {
        organizationId: true,
        organization: { select: { name: true } },
      },
    });

    return rows.map((row) => ({
      organizationId: row.organizationId,
      organizationName: row.organization.name,
    }));
  }

  async searchSupportUsers(
    query: SearchSupportUsersQuery,
  ): Promise<SupportUserListItem[]> {
    return this.prisma.user.findMany({
      where: this.supportUserWhere(query),
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: { [query.orderBy]: query.orderDirection },
      select: {
        id: true,
        name: true,
        email: true,
        mustChangePassword: true,
        createdAt: true,
      },
    });
  }

  async countSupportUsers(query: SearchSupportUsersQuery): Promise<number> {
    return this.prisma.user.count({ where: this.supportUserWhere(query) });
  }

  async searchAuditLogs(query: SearchAuditLogsQuery): Promise<AuditLogListItem[]> {
    const rows = await this.prisma.platformAuditLog.findMany({
      where: this.auditLogWhere(query),
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: { createdAt: query.orderDirection },
      include: {
        actor: { select: { name: true } },
      },
    });

    const organizationIds = [
      ...new Set(
        rows
          .map((row) => row.organizationId)
          .filter((id): id is string => id !== null),
      ),
    ];
    const organizations =
      organizationIds.length === 0
        ? []
        : await this.prisma.organization.findMany({
            where: { id: { in: organizationIds } },
            select: { id: true, name: true },
          });
    const nameById = new Map(
      organizations.map((organization) => [organization.id, organization.name]),
    );

    return rows.map((row) => ({
      id: row.id,
      actorUserId: row.actorUserId,
      actorName: row.actor.name,
      action: row.action,
      targetType: row.targetType,
      targetId: row.targetId,
      organizationId: row.organizationId,
      organizationName: row.organizationId
        ? (nameById.get(row.organizationId) ?? null)
        : null,
      createdAt: row.createdAt,
    }));
  }

  async countAuditLogs(query: SearchAuditLogsQuery): Promise<number> {
    return this.prisma.platformAuditLog.count({
      where: this.auditLogWhere(query),
    });
  }

  private activeSupportAccessWhere(
    query: SearchSupportAccessQuery,
  ): Prisma.SupportAccessWhereInput {
    return {
      revokedAt: null,
      organizationId: query.organizationId,
      userId: query.userId,
    };
  }

  private supportUserWhere(
    query: SearchSupportUsersQuery,
  ): Prisma.UserWhereInput {
    return {
      platformRole: PlatformRole.PLATFORM_SUPPORT,
      name: query.name
        ? { contains: query.name, mode: 'insensitive' }
        : undefined,
      email: query.email
        ? { contains: query.email, mode: 'insensitive' }
        : undefined,
    };
  }

  private auditLogWhere(query: SearchAuditLogsQuery): Prisma.PlatformAuditLogWhereInput {
    return {
      organizationId: query.organizationId,
      actorUserId: query.actorUserId,
      action: query.action,
    };
  }

  private organizationFarmWhere(
    query: SearchPlatformOrganizationFarmsQuery,
  ): Prisma.FarmWhereInput {
    return {
      organizationId: query.organizationId,
      name: query.name
        ? { contains: query.name, mode: 'insensitive' }
        : undefined,
    };
  }

  private organizationWhere(
    query: SearchPlatformOrganizationsQuery,
  ): Prisma.OrganizationWhereInput {
    return {
      name: query.name
        ? { contains: query.name, mode: 'insensitive' }
        : undefined,
    };
  }

  private userWhere(query: SearchPlatformUsersQuery): Prisma.UserWhereInput {
    return {
      name: query.name
        ? { contains: query.name, mode: 'insensitive' }
        : undefined,
      email: query.email
        ? { contains: query.email, mode: 'insensitive' }
        : undefined,
      memberships: query.organizationId
        ? { some: { organizationId: query.organizationId } }
        : undefined,
    };
  }

  private async lastAccessByOrganization(organizationIds: string[]) {
    const lastAccess = new Map<string, Date>();

    if (organizationIds.length === 0) {
      return lastAccess;
    }

    const memberships = await this.prisma.membership.findMany({
      where: { organizationId: { in: organizationIds } },
      select: { organizationId: true, userId: true },
    });

    const userIds = [
      ...new Set(memberships.map((membership) => membership.userId)),
    ];

    if (userIds.length === 0) {
      return lastAccess;
    }

    const latestByUser = await this.prisma.refreshToken.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds } },
      _max: { createdAt: true },
    });

    const createdAtByUser = new Map<string, Date>();
    for (const row of latestByUser) {
      if (row._max.createdAt) {
        createdAtByUser.set(row.userId, row._max.createdAt);
      }
    }

    for (const membership of memberships) {
      const createdAt = createdAtByUser.get(membership.userId);
      if (!createdAt) {
        continue;
      }

      const current = lastAccess.get(membership.organizationId);
      if (!current || createdAt > current) {
        lastAccess.set(membership.organizationId, createdAt);
      }
    }

    return lastAccess;
  }
}

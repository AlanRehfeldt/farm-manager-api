import { ConflictException, Injectable } from '@nestjs/common';
import {
  CropSeasonStatus,
  Farm,
  Organization,
  OrganizationStatus,
  PlatformRole,
  Prisma,
  Role,
  TransactionType,
} from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { seedCostCategories } from 'src/modules/cost-category/domain/seed-cost-categories';
import {
  ADOPTION_ACTIVE_DAYS,
  ADOPTION_RECENT_DAYS,
  ADOPTION_TIME_ZONE,
  adoptionWeekSeries,
  adoptionWindowStart,
} from '../domain/adoption-window';
import { organizationListWhere } from '../domain/organization-list-where';
import {
  AdoptionSummary,
  PlatformOrganizationListItem,
  PlatformOrganizationUsage,
  UpdatePlatformOrganizationProfile,
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

      await seedCostCategories(tx, organization.id);

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

  async organizationUsage(
    organizationId: string,
    since: Date,
  ): Promise<PlatformOrganizationUsage> {
    const empty: PlatformOrganizationUsage = {
      activities: 0,
      purchases: 0,
      salaries: 0,
      genericExpenses: 0,
      harvests: 0,
      activeSeasons: 0,
      seasonCount: 0,
    };
    const farms = await this.prisma.farm.findMany({
      where: { organizationId },
      select: { id: true },
    });
    const farmIds = farms.map((farm) => farm.id);

    if (farmIds.length === 0) {
      return empty;
    }

    const farmId = { in: farmIds };
    const [activities, transactions, harvests, activeSeasons, seasonCount] =
      await Promise.all([
        this.prisma.activity.count({
          where: { farmId, createdAt: { gte: since } },
        }),
        this.prisma.transaction.groupBy({
          by: ['type'],
          where: { farmId, createdAt: { gte: since } },
          _count: { _all: true },
        }),
        this.prisma.harvest.count({
          where: { farmId, createdAt: { gte: since } },
        }),
        this.prisma.cropSeason.count({
          where: { farmId, status: CropSeasonStatus.ACTIVE },
        }),
        this.prisma.cropSeason.count({ where: { farmId } }),
      ]);

    const countByType = new Map(
      transactions.map((row) => [row.type, row._count._all]),
    );

    return {
      activities,
      purchases: countByType.get(TransactionType.PURCHASE_INPUT) ?? 0,
      salaries: countByType.get(TransactionType.SALARY_PAYMENT) ?? 0,
      genericExpenses: countByType.get(TransactionType.GENERIC) ?? 0,
      harvests,
      activeSeasons,
      seasonCount,
    };
  }

  async updateOrganizationProfile(
    organizationId: string,
    data: UpdatePlatformOrganizationProfile,
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
        data,
      });

      await appendPlatformAuditLog(tx, {
        actorUserId,
        action: PlatformAuditAction.ORGANIZATION_UPDATED,
        targetType: 'Organization',
        targetId: organization.id,
        organizationId: organization.id,
      });

      return organization;
    });
  }

  async removeOrganizationMember(input: {
    actorUserId: string;
    organizationId: string;
    userId: string;
    guardLastOrgAdmin: boolean;
  }): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      if (input.guardLastOrgAdmin) {
        const admins = await tx.$queryRaw<Array<{ id: string }>>`
          SELECT membership.id
          FROM memberships AS membership
          INNER JOIN users AS "user" ON "user".id = membership."userId"
          WHERE membership."organizationId" = ${input.organizationId}
            AND membership.role = 'ADMIN'::"Role"
            AND membership."farmId" IS NULL
            AND "user"."platformRole" = 'NONE'::"PlatformRole"
          FOR UPDATE OF membership
        `;

        if (admins.length <= 1) {
          throw new ConflictException(
            'Cannot remove the last admin of the organization',
          );
        }
      }

      await tx.membership.deleteMany({
        where: {
          userId: input.userId,
          organizationId: input.organizationId,
        },
      });

      await tx.refreshToken.updateMany({
        where: {
          userId: input.userId,
          organizationId: input.organizationId,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });

      await appendPlatformAuditLog(tx, {
        actorUserId: input.actorUserId,
        action: PlatformAuditAction.ORGANIZATION_USER_REMOVED,
        targetType: 'User',
        targetId: input.userId,
        organizationId: input.organizationId,
      });
    });
  }

  async adoptionSummary(now: Date): Promise<AdoptionSummary> {
    const since7 = adoptionWindowStart(now, ADOPTION_RECENT_DAYS);
    const since30 = adoptionWindowStart(now, ADOPTION_ACTIVE_DAYS);
    const weeks = adoptionWeekSeries(now);
    const seriesStart = weeks[0]?.since ?? since30;
    const active = OrganizationStatus.ACTIVE;

    const [byStatus, active7d, active30d, silent30d, stale30d, weekRows] =
      await Promise.all([
        this.prisma.organization.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),
        this.prisma.organization.count({
          where: { status: active, lastActivityAt: { gte: since7 } },
        }),
        this.prisma.organization.count({
          where: { status: active, lastActivityAt: { gte: since30 } },
        }),
        this.prisma.organization.count({
          where: {
            status: active,
            OR: [{ lastActivityAt: null }, { lastActivityAt: { lt: since30 } }],
          },
        }),
        this.prisma.organization.count({
          where: {
            status: active,
            OR: [{ lastAccessAt: null }, { lastAccessAt: { lt: since30 } }],
          },
        }),
        this.prisma.$queryRaw<Array<{ week_start: string; count: number }>>`
          SELECT to_char(
            date_trunc(
              'week',
              ("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${ADOPTION_TIME_ZONE}
            ),
            'YYYY-MM-DD'
          ) AS week_start,
          COUNT(*)::int AS count
          FROM "activities"
          WHERE "createdAt" >= ${seriesStart}
          GROUP BY 1
          ORDER BY 1
        `,
      ]);

    const statusCount = new Map(
      byStatus.map((row) => [row.status, row._count._all]),
    );
    const countByWeek = new Map(
      weekRows.map((row) => [row.week_start, Number(row.count)]),
    );

    return {
      organizations: {
        active: statusCount.get(OrganizationStatus.ACTIVE) ?? 0,
        suspended: statusCount.get(OrganizationStatus.SUSPENDED) ?? 0,
      },
      usage: { active7d, active30d, silent30d },
      access: { stale30d },
      activitiesByWeek: weeks.map((week) => ({
        weekStart: week.weekStart,
        count: countByWeek.get(week.weekStart) ?? 0,
      })),
    };
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
        city: true,
        state: true,
        createdAt: true,
        updatedAt: true,
        lastAccessAt: true,
        lastActivityAt: true,
        _count: { select: { farms: true } },
      },
    });

    return organizations.map((organization) => ({
      id: organization.id,
      name: organization.name,
      status: organization.status,
      city: organization.city,
      state: organization.state,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      farmCount: organization._count.farms,
      lastAccessAt: organization.lastAccessAt,
      lastActivityAt: organization.lastActivityAt,
    }));
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

  async listActiveSupportAccess(
    userId: string,
  ): Promise<ActiveSupportAccess[]> {
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

  async searchAuditLogs(
    query: SearchAuditLogsQuery,
  ): Promise<AuditLogListItem[]> {
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

  private auditLogWhere(
    query: SearchAuditLogsQuery,
  ): Prisma.PlatformAuditLogWhereInput {
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
    return organizationListWhere({
      name: query.name,
      status: query.status,
      usage: query.usage,
      access: query.access,
      now: query.now ?? new Date(),
    });
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
}

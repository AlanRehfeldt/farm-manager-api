import { ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { OrganizationSelection, PlatformRole, Role } from '@prisma/client';
import { firstValueFrom, of } from 'rxjs';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { FarmRequestContext } from 'src/common/tenancy/constants';
import { AuthenticatedUser } from 'src/modules/auth/decorators/current-user.decorator';
import { SupportWriteAuditInterceptor } from './support-write-audit.interceptor';

type AuditedRequest = {
  method: string;
  url?: string;
  route?: { path?: string };
  params?: Record<string, string>;
  body?: unknown;
  user?: AuthenticatedUser;
  farmContext?: FarmRequestContext;
};

function user(
  platformRole: PlatformRole,
  userId = 'user-1',
): AuthenticatedUser {
  return {
    userId,
    mustChangePassword: false,
    platformRole,
    organizationSelection: OrganizationSelection.EXEMPT,
    organizationId: null,
  };
}

function createContext(request: AuditedRequest): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}

describe('SupportWriteAuditInterceptor', () => {
  const create = jest.fn().mockResolvedValue({});
  const tx = { platformAuditLog: { create } };
  const prisma = {
    $transaction: jest.fn(
      async (callback: (client: typeof tx) => Promise<void>) => callback(tx),
    ),
  };
  const interceptor = new SupportWriteAuditInterceptor(
    prisma as unknown as PrismaService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    create.mockResolvedValue({});
    prisma.$transaction.mockImplementation(
      async (callback: (client: typeof tx) => Promise<void>) => callback(tx),
    );
  });

  function handle() {
    return { handle: jest.fn(() => of({ ok: true })) };
  }

  async function intercept(request: AuditedRequest, next = handle()) {
    const result = await firstValueFrom(
      interceptor.intercept(createContext(request), next),
    );
    return { result, next };
  }

  it('does not audit a tenant mutation', async () => {
    const next = handle();

    await intercept(
      {
        method: 'POST',
        url: '/fields',
        user: user(PlatformRole.NONE),
      },
      next,
    );

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(next.handle).toHaveBeenCalledTimes(1);
  });

  it('does not audit a platform admin mutation', async () => {
    const next = handle();

    await intercept(
      {
        method: 'POST',
        url: '/platform/organizations',
        user: user(PlatformRole.PLATFORM_ADMIN),
      },
      next,
    );

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(next.handle).toHaveBeenCalledTimes(1);
  });

  it('does not audit a read', async () => {
    const next = handle();

    await intercept(
      {
        method: 'GET',
        url: '/farms',
        user: user(PlatformRole.PLATFORM_SUPPORT, 'support-1'),
      },
      next,
    );

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(next.handle).toHaveBeenCalledTimes(1);
  });

  it('does not audit a support password change', async () => {
    const next = handle();

    await intercept(
      {
        method: 'POST',
        url: '/auth/change-password?foo=1',
        user: user(PlatformRole.PLATFORM_SUPPORT, 'support-1'),
      },
      next,
    );

    await intercept(
      {
        method: 'POST',
        url: '/somewhere-else',
        route: { path: '/auth/change-password' },
        user: user(PlatformRole.PLATFORM_SUPPORT, 'support-1'),
      },
      next,
    );

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(next.handle).toHaveBeenCalledTimes(2);
  });

  it('records a farm-scoped write before the handler', async () => {
    const next = handle();
    prisma.$transaction.mockImplementation(
      async (callback: (client: typeof tx) => Promise<void>) => {
        expect(next.handle).not.toHaveBeenCalled();
        await callback(tx);
        expect(next.handle).not.toHaveBeenCalled();
      },
    );

    await intercept(
      {
        method: 'POST',
        url: '/crop-seasons/season-1/activities',
        route: { path: '/crop-seasons/:cropSeasonId/activities' },
        params: { cropSeasonId: 'season-1' },
        body: { organizationId: 'org-from-body' },
        user: user(PlatformRole.PLATFORM_SUPPORT, 'support-1'),
        farmContext: {
          farmId: 'farm-1',
          organizationId: 'org-1',
          membershipRole: Role.ADMIN,
          supportAccess: true,
        },
      },
      next,
    );

    expect(next.handle).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: {
        actorUserId: 'support-1',
        action: 'TENANT_WRITE',
        targetType: 'POST /crop-seasons/:cropSeasonId/activities',
        targetId: 'season-1',
        organizationId: 'org-1',
        metadata: {
          method: 'POST',
          path: '/crop-seasons/:cropSeasonId/activities',
        },
      },
    });
  });

  it('records organizationId from the membership body', async () => {
    await intercept({
      method: 'POST',
      url: '/memberships',
      route: { path: '/memberships' },
      body: { organizationId: 'org-2', name: 'Operador' },
      user: user(PlatformRole.PLATFORM_SUPPORT, 'support-1'),
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        actorUserId: 'support-1',
        action: 'TENANT_WRITE',
        targetType: 'POST /memberships',
        targetId: null,
        organizationId: 'org-2',
        metadata: { method: 'POST', path: '/memberships' },
      },
    });
  });

  it('records organizationId from params.id on PATCH /organizations/:id', async () => {
    await intercept({
      method: 'PATCH',
      url: '/organizations/org-3',
      route: { path: '/organizations/:id' },
      params: { id: 'org-3' },
      body: { name: 'Nova' },
      user: user(PlatformRole.PLATFORM_SUPPORT, 'support-1'),
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        actorUserId: 'support-1',
        action: 'TENANT_WRITE',
        targetType: 'PATCH /organizations/:id',
        targetId: 'org-3',
        organizationId: 'org-3',
        metadata: { method: 'PATCH', path: '/organizations/:id' },
      },
    });
  });

  it('prefers params.organizationId over the body', async () => {
    await intercept({
      method: 'PATCH',
      url: '/platform/support-access/access-1',
      route: { path: '/platform/support-access/:id' },
      params: { organizationId: 'org-param', id: 'access-1' },
      body: { organizationId: 'org-body' },
      user: user(PlatformRole.PLATFORM_SUPPORT, 'support-1'),
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        actorUserId: 'support-1',
        action: 'TENANT_WRITE',
        targetType: 'PATCH /platform/support-access/:id',
        targetId: 'org-param',
        organizationId: 'org-param',
        metadata: {
          method: 'PATCH',
          path: '/platform/support-access/:id',
        },
      },
    });
  });

  it('does not treat a farm id as the organization', async () => {
    await intercept({
      method: 'PATCH',
      url: '/farms/farm-9',
      route: { path: '/farms/:id' },
      params: { id: 'farm-9' },
      body: { name: 'Sede' },
      user: user(PlatformRole.PLATFORM_SUPPORT, 'support-1'),
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        actorUserId: 'support-1',
        action: 'TENANT_WRITE',
        targetType: 'PATCH /farms/:id',
        targetId: 'farm-9',
        organizationId: null,
        metadata: { method: 'PATCH', path: '/farms/:id' },
      },
    });
  });

  it('does not run the handler when the audit insert fails', async () => {
    const next = handle();
    prisma.$transaction.mockRejectedValue(new Error('db down'));

    await expect(
      firstValueFrom(
        interceptor.intercept(
          createContext({
            method: 'POST',
            url: '/fields',
            user: user(PlatformRole.PLATFORM_SUPPORT, 'support-1'),
            farmContext: {
              farmId: 'farm-1',
              organizationId: 'org-1',
              membershipRole: Role.ADMIN,
              supportAccess: true,
            },
          }),
          next,
        ),
      ),
    ).rejects.toBeInstanceOf(InternalServerErrorException);

    expect(next.handle).not.toHaveBeenCalled();
  });
});

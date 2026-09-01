import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { FarmMembershipGuard } from './farm-membership.guard';
import { PrismaService } from 'src/common/prisma/prisma.service';

function createContext(options: {
  userId?: string;
  farmHeader?: string | string[];
}): { context: ExecutionContext; request: { farmContext?: unknown } } {
  const request = {
    user: options.userId ? { userId: options.userId } : undefined,
    headers: {
      'x-farm-id': options.farmHeader,
    },
    farmContext: undefined as unknown,
  };

  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;

  return { context, request };
}

describe('FarmMembershipGuard', () => {
  const prisma = {
    farm: { findUnique: jest.fn() },
    membership: { findFirst: jest.fn() },
  };

  const guard = new FarmMembershipGuard(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects unauthenticated requests', async () => {
    const { context } = createContext({});

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects missing x-farm-id header', async () => {
    const { context } = createContext({ userId: 'user-1' });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('returns 403 when farm does not exist', async () => {
    prisma.farm.findUnique.mockResolvedValue(null);
    const { context } = createContext({
      userId: 'user-1',
      farmHeader: 'farm-missing',
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('returns 403 when user has no membership for the farm', async () => {
    prisma.farm.findUnique.mockResolvedValue({
      id: 'farm-a',
      organizationId: 'org-1',
    });
    prisma.membership.findFirst.mockResolvedValue(null);
    const { context } = createContext({
      userId: 'user-1',
      farmHeader: 'farm-a',
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('allows a farm-specific membership', async () => {
    prisma.farm.findUnique.mockResolvedValue({
      id: 'farm-a',
      organizationId: 'org-1',
    });
    prisma.membership.findFirst.mockResolvedValue({
      id: 'mem-1',
      role: 'USER',
    });
    const { context, request } = createContext({
      userId: 'user-1',
      farmHeader: 'farm-a',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.farmContext).toEqual({
      farmId: 'farm-a',
      organizationId: 'org-1',
      membershipRole: 'USER',
    });
  });

  it('allows an org-wide membership (farmId null)', async () => {
    prisma.farm.findUnique.mockResolvedValue({
      id: 'farm-b',
      organizationId: 'org-1',
    });
    prisma.membership.findFirst.mockResolvedValue({
      id: 'mem-org',
      role: 'ADMIN',
    });
    const { context } = createContext({
      userId: 'user-1',
      farmHeader: 'farm-b',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(prisma.membership.findFirst).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        organizationId: 'org-1',
        OR: [{ farmId: 'farm-b' }, { farmId: null }],
      },
      select: { id: true, role: true },
    });
  });
});

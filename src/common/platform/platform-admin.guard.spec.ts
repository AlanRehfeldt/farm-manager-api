import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { PlatformAdminGuard } from './platform-admin.guard';
import { PrismaService } from 'src/common/prisma/prisma.service';

function createContext(userId?: string): ExecutionContext {
  const request = {
    user: userId ? { userId } : undefined,
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}

describe('PlatformAdminGuard', () => {
  const prisma = {
    user: { findUnique: jest.fn() },
  };

  const guard = new PlatformAdminGuard(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects unauthenticated requests', async () => {
    const context = createContext();

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects when user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const context = createContext('missing-user');

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('returns 403 when user is not platform admin', async () => {
    prisma.user.findUnique.mockResolvedValue({
      platformRole: PlatformRole.NONE,
    });
    const context = createContext('user-1');

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('allows platform admin', async () => {
    prisma.user.findUnique.mockResolvedValue({
      platformRole: PlatformRole.PLATFORM_ADMIN,
    });
    const context = createContext('admin-1');

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});

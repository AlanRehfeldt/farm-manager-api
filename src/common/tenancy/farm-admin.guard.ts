import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuthenticatedUser } from 'src/modules/auth/decorators/current-user.decorator';
import { FarmRequestContext } from './constants';

type RequestWithTenancy = Request & {
  user?: AuthenticatedUser;
  farmContext?: FarmRequestContext;
};

@Injectable()
export class FarmAdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithTenancy>();
    const userId = request.user?.userId;
    const farmContext = request.farmContext;

    if (!userId) {
      throw new UnauthorizedException();
    }

    if (!farmContext) {
      throw new ForbiddenException('Farm admin access required');
    }

    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        organizationId: farmContext.organizationId,
        role: Role.ADMIN,
        OR: [{ farmId: null }, { farmId: farmContext.farmId }],
      },
      select: { role: true },
    });

    if (!membership) {
      throw new ForbiddenException('Farm admin access required');
    }

    return true;
  }
}

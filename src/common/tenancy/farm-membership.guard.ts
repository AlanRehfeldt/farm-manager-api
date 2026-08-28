import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuthenticatedUser } from 'src/modules/auth/decorators/current-user.decorator';
import { FARM_ID_HEADER, FarmRequestContext } from './constants';

type RequestWithTenancy = Request & {
  user?: AuthenticatedUser;
  farmContext?: FarmRequestContext;
};

@Injectable()
export class FarmMembershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithTenancy>();
    const userId = request.user?.userId;

    if (!userId) {
      throw new UnauthorizedException();
    }

    const farmId = this.readFarmId(request);

    if (!farmId) {
      throw new BadRequestException('x-farm-id header is required');
    }

    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
      select: { id: true, organizationId: true },
    });

    if (!farm) {
      throw new ForbiddenException('Access to this farm is forbidden');
    }

    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        organizationId: farm.organizationId,
        OR: [{ farmId: farm.id }, { farmId: null }],
      },
      select: { id: true },
    });

    if (!membership) {
      throw new ForbiddenException('Access to this farm is forbidden');
    }

    request.farmContext = {
      farmId: farm.id,
      organizationId: farm.organizationId,
    };

    return true;
  }

  private readFarmId(request: Request): string | undefined {
    const header = request.headers[FARM_ID_HEADER];
    if (Array.isArray(header)) {
      return header[0]?.trim() || undefined;
    }
    return header?.trim() || undefined;
  }
}

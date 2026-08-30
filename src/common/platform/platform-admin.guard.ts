import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { Request } from 'express';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuthenticatedUser } from 'src/modules/auth/decorators/current-user.decorator';

type RequestWithUser = Request & {
  user?: AuthenticatedUser;
};

@Injectable()
export class PlatformAdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userId = request.user?.userId;

    if (!userId) {
      throw new UnauthorizedException();
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { platformRole: true },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.platformRole !== PlatformRole.PLATFORM_ADMIN) {
      throw new ForbiddenException('Platform admin access required');
    }

    return true;
  }
}

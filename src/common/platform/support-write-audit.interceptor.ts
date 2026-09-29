import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { Observable, from, switchMap } from 'rxjs';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { FarmRequestContext } from 'src/common/tenancy/constants';
import { AuthenticatedUser } from 'src/modules/auth/decorators/current-user.decorator';
import {
  appendPlatformAuditLog,
  PlatformAuditAction,
} from 'src/modules/platform/repositories/append-platform-audit-log';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

type AuditedRequest = {
  method: string;
  url?: string;
  route?: { path?: string };
  params?: Record<string, string>;
  user?: AuthenticatedUser;
  farmContext?: FarmRequestContext;
};

@Injectable()
export class SupportWriteAuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuditedRequest>();

    if (!MUTATING_METHODS.has(request.method)) {
      return next.handle() as Observable<unknown>;
    }

    return next.handle().pipe(
      switchMap((body: unknown) => from(this.record(request).then(() => body))),
    );
  }

  private async record(request: AuditedRequest): Promise<void> {
    if (request.user?.platformRole !== PlatformRole.PLATFORM_SUPPORT) {
      return;
    }

    const targetId =
      typeof request.params?.id === 'string' ? request.params.id : null;
    const path = request.route?.path ?? request.url ?? request.method;

    try {
      await this.prisma.$transaction((tx) =>
        appendPlatformAuditLog(tx, {
          actorUserId: request.user!.userId,
          action: PlatformAuditAction.TENANT_WRITE,
          targetType: `${request.method} ${path}`,
          targetId,
          organizationId: request.farmContext?.organizationId ?? null,
          metadata: {
            method: request.method,
            path,
          },
        }),
      );
    } catch {
      throw new InternalServerErrorException('Failed to record audit log');
    }
  }
}

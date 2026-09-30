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
  body?: unknown;
  user?: AuthenticatedUser;
  farmContext?: FarmRequestContext;
};

@Injectable()
export class SupportWriteAuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuditedRequest>();

    if (!shouldAudit(request)) {
      return next.handle() as Observable<unknown>;
    }

    return from(this.record(request)).pipe(
      switchMap(() => next.handle() as Observable<unknown>),
    );
  }

  private async record(request: AuditedRequest): Promise<void> {
    const path = resolvePath(request);
    const actorUserId = request.user?.userId;

    if (!actorUserId) {
      return;
    }

    try {
      await this.prisma.$transaction((tx) =>
        appendPlatformAuditLog(tx, {
          actorUserId,
          action: PlatformAuditAction.TENANT_WRITE,
          targetType: `${request.method} ${path}`,
          targetId: readTargetId(request.params),
          organizationId: readOrganizationId(request),
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

function shouldAudit(request: AuditedRequest): boolean {
  if (!MUTATING_METHODS.has(request.method)) {
    return false;
  }

  if (request.user?.platformRole !== PlatformRole.PLATFORM_SUPPORT) {
    return false;
  }

  return !isAuthRequest(request);
}

function isAuthRequest(request: AuditedRequest): boolean {
  return [request.url, request.route?.path].some((value) => isAuthPath(value));
}

function isAuthPath(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  const path = stripQuery(value);
  return path === '/auth' || path.startsWith('/auth/');
}

function resolvePath(request: AuditedRequest): string {
  return stripQuery(request.route?.path ?? request.url ?? request.method);
}

function stripQuery(value: string): string {
  return value.split('?')[0] ?? value;
}

function readTargetId(
  params: Record<string, string> | undefined,
): string | null {
  if (!params) {
    return null;
  }

  for (const value of Object.values(params)) {
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  return null;
}

function readOrganizationId(request: AuditedRequest): string | null {
  const fromFarm = nonEmptyString(request.farmContext?.organizationId);
  if (fromFarm) {
    return fromFarm;
  }

  const fromParam = nonEmptyString(request.params?.organizationId);
  if (fromParam) {
    return fromParam;
  }

  const fromBody = nonEmptyString(readBodyOrganizationId(request.body));
  if (fromBody) {
    return fromBody;
  }

  if (isOrganizationByIdPath(request)) {
    return nonEmptyString(request.params?.id);
  }

  return null;
}

function readBodyOrganizationId(body: unknown): unknown {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return null;
  }

  return (body as { organizationId?: unknown }).organizationId;
}

function isOrganizationByIdPath(request: AuditedRequest): boolean {
  return [request.route?.path, request.url].some((value) => {
    if (!value) {
      return false;
    }

    const path = stripQuery(value);
    return (
      path === '/organizations/:id' || /^\/organizations\/[^/]+$/.test(path)
    );
  });
}

function nonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }

  return value;
}

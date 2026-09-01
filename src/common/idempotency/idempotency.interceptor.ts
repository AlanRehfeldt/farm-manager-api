import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable, firstValueFrom, from } from 'rxjs';
import { FarmRequestContext } from 'src/common/tenancy/constants';
import { IDEMPOTENCY_KEY_HEADER, IDEMPOTENT_METADATA_KEY } from './constants';
import { IdempotencyService } from './idempotency.service';

type RequestWithTenancy = Request & {
  farmContext?: FarmRequestContext;
  route?: { path?: string };
};

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const isIdempotent = this.reflector.getAllAndOverride<boolean>(
      IDEMPOTENT_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isIdempotent) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<RequestWithTenancy>();
    const farmId = request.farmContext?.farmId;
    const key = this.readIdempotencyKey(request);

    if (!key || !farmId) {
      return next.handle();
    }

    const path = this.resolveRequestPath(request);

    return from(
      this.idempotencyService.resolveOrExecute({
        farmId,
        key,
        method: request.method,
        path,
        body: request.body as unknown,
        execute: () => firstValueFrom(next.handle()),
      }),
    );
  }

  private resolveRequestPath(request: RequestWithTenancy): string {
    const route = request.route as { path?: string } | undefined;

    return route?.path ?? request.path;
  }

  private readIdempotencyKey(request: Request): string | undefined {
    const header = request.headers[IDEMPOTENCY_KEY_HEADER];

    if (Array.isArray(header)) {
      return header[0]?.trim() || undefined;
    }

    return header?.trim() || undefined;
  }
}

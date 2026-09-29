import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrganizationSelection } from '@prisma/client';
import { Request } from 'express';
import { AuthenticatedUser } from '../decorators/current-user.decorator';
import { ALLOW_PENDING_ORGANIZATION_SELECTION_KEY } from '../decorators/allow-pending-organization-selection.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

type RequestWithUser = Request & {
  user?: AuthenticatedUser;
};

@Injectable()
export class OrganizationSelectionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const allowPending = this.reflector.getAllAndOverride<boolean>(
      ALLOW_PENDING_ORGANIZATION_SELECTION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (allowPending) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user?.userId) {
      throw new UnauthorizedException();
    }

    if (user.organizationSelection === OrganizationSelection.PENDING) {
      throw new ForbiddenException('Organization selection required');
    }

    return true;
  }
}

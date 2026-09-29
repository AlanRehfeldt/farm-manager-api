import { OrganizationSelection, PlatformRole } from '@prisma/client';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type AuthenticatedUser = {
  userId: string;
  mustChangePassword: boolean;
  platformRole: PlatformRole;
  organizationSelection: OrganizationSelection;
  organizationId: string | null;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();
    return request.user;
  },
);

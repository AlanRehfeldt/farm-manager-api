import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';
import { FarmRequestContext } from './constants';

type RequestWithFarm = {
  farmContext?: FarmRequestContext;
};

export const MembershipRole = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Role => {
    const request = context.switchToHttp().getRequest<RequestWithFarm>();
    return request.farmContext!.membershipRole;
  },
);

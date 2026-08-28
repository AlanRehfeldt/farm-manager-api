import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FarmRequestContext } from './constants';

type RequestWithFarm = {
  farmContext?: FarmRequestContext;
};

export const OrganizationId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<RequestWithFarm>();
    return request.farmContext!.organizationId;
  },
);

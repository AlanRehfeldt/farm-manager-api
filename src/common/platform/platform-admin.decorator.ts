import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ForbiddenDto } from 'src/common/errors/forbidden.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { PlatformAdminGuard } from './platform-admin.guard';

export function PlatformAdmin() {
  return applyDecorators(
    UseGuards(PlatformAdminGuard),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid authentication',
      type: UnauthorizedDto,
    }),
    ApiForbiddenResponse({
      description: 'Caller is not a platform admin',
      type: ForbiddenDto,
    }),
  );
}

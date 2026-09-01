import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiForbiddenResponse } from '@nestjs/swagger';
import { ForbiddenDto } from 'src/common/errors/forbidden.dto';
import { FarmAdminGuard } from './farm-admin.guard';
import { FarmScoped } from './farm-scoped.decorator';

export function FarmAdmin() {
  return applyDecorators(
    FarmScoped(),
    UseGuards(FarmAdminGuard),
    ApiForbiddenResponse({
      description: 'Caller is not a farm or org admin',
      type: ForbiddenDto,
    }),
  );
}

import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ForbiddenDto } from 'src/common/errors/forbidden.dto';
import { FARM_ID_HEADER } from './constants';
import { FarmMembershipGuard } from './farm-membership.guard';

export function FarmScoped() {
  return applyDecorators(
    UseGuards(FarmMembershipGuard),
    ApiHeader({
      name: FARM_ID_HEADER,
      required: true,
      description: 'Active farm identifier',
    }),
    ApiBadRequestResponse({
      description: 'Missing x-farm-id header',
      type: BadRequestDto,
    }),
    ApiForbiddenResponse({
      description: 'Caller has no membership for this farm (FORBIDDEN_FARM)',
      type: ForbiddenDto,
    }),
  );
}

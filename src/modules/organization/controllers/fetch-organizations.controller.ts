import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import z from 'zod';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import {
  AuthenticatedUser,
  CurrentUser,
} from 'src/modules/auth/decorators/current-user.decorator';
import { FetchOrganizationsQueryDto } from '../dtos/request/fetch-organizations.dto';
import { FetchOrganizationsResponseDto } from '../dtos/response/fetch-organizations.dto';
import { FetchOrganizationsService } from '../services/fetch-organizations.service';

const fetchOrganizationsSchema = z.object({
  name: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('name'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('asc'),
});

@ApiTags('Organization')
@Controller('/organizations')
export class FetchOrganizationsController {
  constructor(
    private readonly fetchOrganizationsService: FetchOrganizationsService,
  ) {}

  @ApiOperation({ summary: 'List organizations of the authenticated user' })
  @ApiOkResponse({
    description: 'Organizations retrieved successfully',
    type: FetchOrganizationsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid query',
    type: BadRequestDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @Get()
  async fetch(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(fetchOrganizationsSchema))
    query: FetchOrganizationsQueryDto,
  ) {
    return this.fetchOrganizationsService.execute(user.userId, {
      name: query.name,
      page: query.page ?? 1,
      perPage: query.perPage ?? 10,
      orderBy: query.orderBy ?? 'name',
      orderDirection: query.orderDirection ?? 'asc',
    });
  }
}

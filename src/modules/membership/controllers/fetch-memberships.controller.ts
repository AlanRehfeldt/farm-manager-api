import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import z from 'zod';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ForbiddenDto } from 'src/common/errors/forbidden.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import {
  AuthenticatedUser,
  CurrentUser,
} from 'src/modules/auth/decorators/current-user.decorator';
import { FetchMembershipsQueryDto } from '../dtos/request/fetch-memberships.dto';
import { FetchMembershipsResponseDto } from '../dtos/response/fetch-memberships.dto';
import { FetchMembershipsService } from '../services/fetch-memberships.service';

const fetchMembershipsSchema = z.object({
  organizationId: z.uuid(),
  farmId: z.uuid().optional(),
  userId: z.uuid().optional(),
  role: z.enum(['ADMIN', 'USER']).optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('createdAt'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('desc'),
});

@ApiTags('Membership')
@Controller('/memberships')
export class FetchMembershipsController {
  constructor(
    private readonly fetchMembershipsService: FetchMembershipsService,
  ) {}

  @ApiOperation({ summary: 'List memberships of an organization' })
  @ApiOkResponse({
    description: 'Memberships retrieved successfully',
    type: FetchMembershipsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid query',
    type: BadRequestDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiForbiddenResponse({
    description: 'Only organization admins can list memberships',
    type: ForbiddenDto,
  })
  @Get()
  async fetch(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(fetchMembershipsSchema))
    query: FetchMembershipsQueryDto,
  ) {
    return this.fetchMembershipsService.execute(user.userId, {
      organizationId: query.organizationId!,
      farmId: query.farmId,
      userId: query.userId,
      role: query.role,
      page: query.page ?? 1,
      perPage: query.perPage ?? 10,
      orderBy: query.orderBy ?? 'createdAt',
      orderDirection: query.orderDirection ?? 'desc',
    });
  }
}

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
import { FetchFarmsQueryDto } from '../dtos/request/fetch-farms.dto';
import { FetchFarmsResponseDto } from '../dtos/response/fetch-farms.dto';
import { FetchFarmsService } from '../services/fetch-farms.service';

const fetchFarmsSchema = z.object({
  name: z.string().optional(),
  organizationId: z.uuid().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('name'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('asc'),
});

@ApiTags('Farm')
@Controller('/farms')
export class FetchFarmsController {
  constructor(private readonly fetchFarmsService: FetchFarmsService) {}

  @ApiOperation({ summary: 'List farms accessible to the authenticated user' })
  @ApiOkResponse({
    description: 'Farms retrieved successfully',
    type: FetchFarmsResponseDto,
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
    @Query(new ZodValidationPipe(fetchFarmsSchema))
    query: FetchFarmsQueryDto,
  ) {
    return this.fetchFarmsService.execute(user.userId, {
      name: query.name,
      organizationId: query.organizationId,
      page: query.page ?? 1,
      perPage: query.perPage ?? 10,
      orderBy: query.orderBy ?? 'name',
      orderDirection: query.orderDirection ?? 'asc',
    });
  }
}

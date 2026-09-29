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
import { PlatformAdmin } from 'src/common/platform/platform-admin.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { FetchPlatformUsersQueryDto } from '../dtos/request/fetch-platform-users.dto';
import { FetchPlatformUsersResponseDto } from '../dtos/response/fetch-platform-users.dto';
import { FetchPlatformUsersService } from '../services/fetch-platform-users.service';

const fetchPlatformUsersSchema = z.object({
  organizationId: z.uuid().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.enum(['name', 'email', 'createdAt']).optional().default('name'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('asc'),
});

@ApiTags('Platform')
@PlatformAdmin()
@Controller('/platform/users')
export class FetchPlatformUsersController {
  constructor(
    private readonly fetchPlatformUsersService: FetchPlatformUsersService,
  ) {}

  @ApiOperation({ summary: 'List users across organizations' })
  @ApiOkResponse({
    description: 'Users retrieved successfully',
    type: FetchPlatformUsersResponseDto,
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
    description: 'Platform admin access required',
    type: ForbiddenDto,
  })
  @Get()
  async fetch(
    @Query(new ZodValidationPipe(fetchPlatformUsersSchema))
    query: FetchPlatformUsersQueryDto,
  ) {
    return this.fetchPlatformUsersService.execute({
      organizationId: query.organizationId,
      name: query.name,
      email: query.email,
      page: query.page ?? 1,
      perPage: query.perPage ?? 10,
      orderBy: query.orderBy ?? 'name',
      orderDirection: query.orderDirection ?? 'asc',
    });
  }
}

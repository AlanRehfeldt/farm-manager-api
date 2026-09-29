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
import { FetchPlatformOrganizationsQueryDto } from '../dtos/request/fetch-platform-organizations.dto';
import { FetchPlatformOrganizationsResponseDto } from '../dtos/response/fetch-platform-organizations.dto';
import { FetchPlatformOrganizationsService } from '../services/fetch-platform-organizations.service';

const fetchPlatformOrganizationsSchema = z.object({
  name: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.enum(['name', 'createdAt']).optional().default('name'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('asc'),
});

@ApiTags('Platform')
@PlatformAdmin()
@Controller('/platform/organizations')
export class FetchPlatformOrganizationsController {
  constructor(
    private readonly fetchPlatformOrganizationsService: FetchPlatformOrganizationsService,
  ) {}

  @ApiOperation({
    summary: 'List organizations with adoption metrics',
  })
  @ApiOkResponse({
    description: 'Organizations retrieved successfully',
    type: FetchPlatformOrganizationsResponseDto,
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
    @Query(new ZodValidationPipe(fetchPlatformOrganizationsSchema))
    query: FetchPlatformOrganizationsQueryDto,
  ) {
    return this.fetchPlatformOrganizationsService.execute({
      name: query.name,
      page: query.page ?? 1,
      perPage: query.perPage ?? 10,
      orderBy: query.orderBy ?? 'name',
      orderDirection: query.orderDirection ?? 'asc',
    });
  }
}

import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import z from 'zod';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ForbiddenDto } from 'src/common/errors/forbidden.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { PlatformAdmin } from 'src/common/platform/platform-admin.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import {
  FetchPlatformOrganizationFarmsParamDto,
  FetchPlatformOrganizationFarmsQueryDto,
} from '../dtos/request/fetch-platform-organization-farms.dto';
import { FetchPlatformOrganizationFarmsResponseDto } from '../dtos/response/fetch-platform-organization-farms.dto';
import { FetchPlatformOrganizationFarmsService } from '../services/fetch-platform-organization-farms.service';

const fetchPlatformOrganizationFarmsParamSchema = z.object({
  organizationId: z.uuid(),
});

const fetchPlatformOrganizationFarmsQuerySchema = z.object({
  name: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.enum(['name', 'createdAt']).optional().default('name'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('asc'),
});

@ApiTags('Platform')
@PlatformAdmin()
@Controller('/platform/organizations')
export class FetchPlatformOrganizationFarmsController {
  constructor(
    private readonly fetchPlatformOrganizationFarmsService: FetchPlatformOrganizationFarmsService,
  ) {}

  @ApiOperation({
    summary: 'List farms of an organization',
  })
  @ApiOkResponse({
    description: 'Farms retrieved successfully',
    type: FetchPlatformOrganizationFarmsResponseDto,
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
  @ApiNotFoundResponse({
    description: 'Organization does not exist',
    type: NotFoundDto,
  })
  @Get('/:organizationId/farms')
  async fetch(
    @Param(new ZodValidationPipe(fetchPlatformOrganizationFarmsParamSchema))
    params: FetchPlatformOrganizationFarmsParamDto,
    @Query(new ZodValidationPipe(fetchPlatformOrganizationFarmsQuerySchema))
    query: FetchPlatformOrganizationFarmsQueryDto,
  ) {
    return this.fetchPlatformOrganizationFarmsService.execute({
      organizationId: params.organizationId,
      name: query.name,
      page: query.page ?? 1,
      perPage: query.perPage ?? 10,
      orderBy: query.orderBy ?? 'name',
      orderDirection: query.orderDirection ?? 'asc',
    });
  }
}

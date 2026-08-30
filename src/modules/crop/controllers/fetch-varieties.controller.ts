import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { FetchVarietiesQueryDto } from '../dtos/request/variety-request.dto';
import { FetchVarietiesResponseDto } from '../dtos/response/variety-response.dto';
import { FetchVarietiesService } from '../services/fetch-varieties.service';

const fetchVarietiesSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().optional(),
  cropId: z.uuid().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('name'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('asc'),
});

@ApiTags('Variety')
@FarmScoped()
@Controller('/varieties')
export class FetchVarietiesController {
  constructor(private readonly fetchVarietiesService: FetchVarietiesService) {}

  @ApiOperation({ summary: 'List varieties' })
  @ApiOkResponse({
    description: 'Varieties retrieved successfully',
    type: FetchVarietiesResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid query',
    type: BadRequestDto,
  })
  @Get()
  async fetch(
    @OrganizationId() organizationId: string,
    @Query(new ZodValidationPipe(fetchVarietiesSchema))
    query: FetchVarietiesQueryDto,
  ) {
    return await this.fetchVarietiesService.execute({
      ...query,
      organizationId,
      page: query.page ?? 1,
      perPage: query.perPage ?? 10,
      orderBy: query.orderBy ?? 'name',
      orderDirection: (query.orderDirection ?? 'asc') as 'asc' | 'desc',
    });
  }
}

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
import { FetchCostCategoriesQueryDto } from '../dtos/request/fetch-cost-categories.dto';
import { FetchCostCategoriesResponseDto } from '../dtos/response/fetch-cost-categories.dto';
import { FetchCostCategoriesService } from '../services/fetch-cost-categories.service';

const fetchCostCategoriesSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().optional(),
  code: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z
    .enum(['name', 'code', 'createdAt', 'updatedAt'])
    .optional()
    .default('name'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('asc'),
});

@ApiTags('CostCategory')
@FarmScoped()
@Controller('/cost-categories')
export class FetchCostCategoriesController {
  constructor(
    private readonly fetchCostCategoriesService: FetchCostCategoriesService,
  ) {}

  @ApiOperation({ summary: 'List cost categories' })
  @ApiOkResponse({
    description: 'Cost categories retrieved successfully',
    type: FetchCostCategoriesResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid query parameters',
    type: BadRequestDto,
  })
  @Get()
  async fetch(
    @OrganizationId() organizationId: string,
    @Query(new ZodValidationPipe(fetchCostCategoriesSchema))
    query: FetchCostCategoriesQueryDto,
  ) {
    const { results, total, page, perPage, orderBy, orderDirection } =
      await this.fetchCostCategoriesService.execute({
        ...query,
        organizationId,
        page: query.page ?? 1,
        perPage: query.perPage ?? 10,
        orderBy: query.orderBy ?? 'name',
        orderDirection: query.orderDirection ?? 'asc',
      });

    return {
      results,
      total,
      page,
      perPage,
      orderBy,
      orderDirection,
    };
  }
}

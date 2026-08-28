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
import { FetchCostCentersQueryDto } from '../dtos/request/fetch-cost-centers.dto';
import { FetchCostCentersResponseDto } from '../dtos/response/fetch-cost-centers.dto';
import { FetchCostCentersService } from '../services/fetch-cost-center.service';

const fetchCostCentersSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  code: z.string().optional(),
  parentId: z.uuid().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('name'),
  orderDirection: z.string().optional().default('asc'),
});

@ApiTags('CostCenter')
@FarmScoped()
@Controller('/cost-centers')
export class FetchCostCentersController {
  constructor(
    private readonly fetchCostCentersService: FetchCostCentersService,
  ) {}

  @ApiOperation({ summary: 'List cost centers' })
  @ApiOkResponse({
    description: 'Cost centers retrieved successfully',
    type: FetchCostCentersResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @Get()
  async fetch(
    @OrganizationId() organizationId: string,
    @Query(new ZodValidationPipe(fetchCostCentersSchema))
    query: FetchCostCentersQueryDto,
  ) {
    const { results, total, page, perPage, orderBy, orderDirection } =
      await this.fetchCostCentersService.execute({
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

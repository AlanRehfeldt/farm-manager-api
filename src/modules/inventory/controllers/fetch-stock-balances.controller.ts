import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { FetchStockBalancesQueryDto } from '../dtos/response/stock-balance-response.dto';
import { FetchStockBalancesResponseDto } from '../dtos/response/stock-balance-response.dto';
import { FetchStockBalancesService } from '../services/fetch-stock-balances.service';

const fetchStockBalancesSchema = z.object({
  name: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('name'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('asc'),
});

@ApiTags('Inventory')
@FarmScoped()
@Controller('/stock-balances')
export class FetchStockBalancesController {
  constructor(
    private readonly fetchStockBalancesService: FetchStockBalancesService,
  ) {}

  @ApiOperation({ summary: 'List stock balances' })
  @ApiOkResponse({
    description: 'Stock balances retrieved successfully',
    type: FetchStockBalancesResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid query',
    type: BadRequestDto,
  })
  @Get()
  async fetch(
    @OrganizationId() organizationId: string,
    @FarmId() farmId: string,
    @Query(new ZodValidationPipe(fetchStockBalancesSchema))
    query: FetchStockBalancesQueryDto,
  ) {
    return await this.fetchStockBalancesService.execute({
      organizationId,
      farmId,
      name: query.name,
      page: query.page ?? 1,
      perPage: query.perPage ?? 10,
      orderBy: query.orderBy ?? 'name',
      orderDirection: (query.orderDirection ?? 'asc') as 'asc' | 'desc',
    });
  }
}

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
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { FetchPurchasesQueryDto } from '../dtos/request/purchase.dto';
import { FetchPurchasesResponseDto } from '../dtos/response/purchase-response.dto';
import { FetchPurchasesService } from '../services/fetch-purchases.service';

const fetchPurchasesSchema = z.object({
  name: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('date'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('desc'),
});

@ApiTags('Purchase')
@FarmScoped()
@Controller('/purchases')
export class FetchPurchasesController {
  constructor(private readonly fetchPurchasesService: FetchPurchasesService) {}

  @ApiOperation({ summary: 'List purchases' })
  @ApiOkResponse({
    description: 'Purchases retrieved successfully',
    type: FetchPurchasesResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid query',
    type: BadRequestDto,
  })
  @Get()
  async fetch(
    @FarmId() farmId: string,
    @Query(new ZodValidationPipe(fetchPurchasesSchema))
    query: FetchPurchasesQueryDto,
  ) {
    return await this.fetchPurchasesService.execute({
      farmId,
      name: query.name,
      page: query.page ?? 1,
      perPage: query.perPage ?? 10,
      orderBy: query.orderBy ?? 'date',
      orderDirection: (query.orderDirection ?? 'desc') as 'asc' | 'desc',
    });
  }
}

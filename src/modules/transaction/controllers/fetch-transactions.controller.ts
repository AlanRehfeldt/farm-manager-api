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
import { FetchTransactionsQueryDto } from '../dtos/request/fetch-transactions.dto';
import { FetchTransactionsResponseDto } from '../dtos/response/fetch-transactions.dto';
import { FetchTransactionsService } from '../services/fetch-transactions.service';

const fetchTransactionsSchema = z.object({
  id: z.uuid().optional(),
  type: z.enum(['PURCHASE_INPUT', 'SALARY_PAYMENT', 'GENERIC']).optional(),
  date: z.date().optional(),
  note: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('date'),
  orderDirection: z.string().optional().default('asc'),
});

@ApiTags('Transaction')
@FarmScoped()
@Controller('/transactions')
export class FetchTransactionsController {
  constructor(
    private readonly fetchTransactionsService: FetchTransactionsService,
  ) {}

  @ApiOperation({ summary: 'List transactions' })
  @ApiOkResponse({
    description: 'Transactions retrieved successfully',
    type: FetchTransactionsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @Get()
  async fetch(
    @FarmId() farmId: string,
    @Query(new ZodValidationPipe(fetchTransactionsSchema))
    query: FetchTransactionsQueryDto,
  ) {
    const { results, total, page, perPage, orderBy, orderDirection } =
      await this.fetchTransactionsService.execute({
        ...query,
        farmId,
        page: query.page ?? 1,
        perPage: query.perPage ?? 10,
        orderBy: query.orderBy ?? 'date',
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

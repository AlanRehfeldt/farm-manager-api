import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { FetchTransactionsService } from '../services/fetch-transactions.service';
import { FetchTransactionsQueryDto } from '../dtos/request/fetch-transactions.dto';
import { FetchTransactionsResponseDto } from '../dtos/response/fetch-transactions.dto';

const fetchTransactionsSchema = z.object({
  id: z.uuid().optional(),
  type: z.enum(['PURCHASE_INPUT', 'SALARY_PAYMENT', 'GENERIC']).optional(),
  date: z.date().optional(),
  note: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('name'),
  orderDirection: z.string().optional().default('asc'),
});

@ApiTags('Transaction')
@Controller('/transactions')
export class FetchTransactionsController {
  constructor(
    private readonly fetchTransactionsService: FetchTransactionsService,
  ) {}

  @ApiOperation({ summary: 'List transactions' })
  @ApiOkResponse({
    description: 'Transactions retrived successfully',
    type: FetchTransactionsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @Get()
  @UsePipes(new ZodValidationPipe(fetchTransactionsSchema))
  async fetch(@Query() query: FetchTransactionsQueryDto) {
    try {
      const { results, total, page, perPage, orderBy, orderDirection } =
        await this.fetchTransactionsService.execute(query);

      return {
        results,
        total,
        page,
        perPage,
        orderBy,
        orderDirection,
      };
    } catch (error) {
      console.error('Error fetching transactions', error);
      throw error;
    }
  }
}

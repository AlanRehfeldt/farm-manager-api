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
import { FetchInstallmentsService } from '../services/fetch-installments.service';
import { FetchInstallmentsQueryDto } from '../dtos/request/fetch-installments.dto';
import { FetchInstallmentsResponseDto } from '../dtos/response/fetch-installments.dto';

const fetchInstallmentsSchema = z.object({
  id: z.uuid().optional(),
  valueInCentsFrom: z.coerce.number().optional(),
  valueInCentsTo: z.coerce.number().optional(),
  dueDateFrom: z.date().optional(),
  dueDateTo: z.date().optional(),
  paymentDateFrom: z.date().optional(),
  paymentDateTo: z.date().optional(),
  paymentForm: z
    .enum([
      'CASH',
      'CREDIT_CARD',
      'DEBIT_CARD',
      'BANK_SLIP',
      'TRANSFER',
      'PIX',
      'CHECK',
      'DIGITAL_WALLET',
      'LOAN',
      'TRADE',
      'FINANCING',
      'OTHER',
    ])
    .optional(),
  transactionId: z.uuid().optional(),
  createdAtFrom: z.date().optional(),
  createdAtTo: z.date().optional(),
  updatedAtFrom: z.date().optional(),
  updatedAtTo: z.date().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('name'),
  orderDirection: z.string().optional().default('asc'),
});

@ApiTags('Installment')
@Controller('/installments')
export class FetchInstallmentsController {
  constructor(
    private readonly fetchInstallmentsService: FetchInstallmentsService,
  ) {}

  @ApiOperation({ summary: 'List installments' })
  @ApiOkResponse({
    description: 'Installments retrived successfully',
    type: FetchInstallmentsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @Get()
  @UsePipes(new ZodValidationPipe(fetchInstallmentsSchema))
  async fetch(@Query() query: FetchInstallmentsQueryDto) {
    try {
      const { results, total, page, perPage, orderBy, orderDirection } =
        await this.fetchInstallmentsService.execute(query);

      return {
        results,
        total,
        page,
        perPage,
        orderBy,
        orderDirection,
      };
    } catch (error) {
      console.error('Error fetching installments', error);
      throw error;
    }
  }
}

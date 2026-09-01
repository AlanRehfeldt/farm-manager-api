import { Body, Controller, Post } from '@nestjs/common';
import { throwDeprecatedWriteEndpoint } from 'src/common/http/deprecated-endpoint';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { CreateTransactionBodyDto } from '../dtos/request/create-transaction.dto';
import { CreateTransactionResponseDto } from '../dtos/response/create-transaction.dto';
import { CreateTransactionService } from '../services/create-transaction.service';

const createTransactionBodySchema = z.object({
  type: z.enum(['PURCHASE_INPUT', 'SALARY_PAYMENT', 'GENERIC']),
  date: z.coerce.date(),
  note: z.string().optional(),
});

@ApiTags('Transaction')
@FarmScoped()
@Controller('/transactions')
export class CreateTransactionController {
  constructor(
    private readonly createTransactionService: CreateTransactionService,
  ) {}

  @ApiOperation({ summary: 'Create transaction' })
  @ApiCreatedResponse({
    description: 'Transaction created successfully',
    type: CreateTransactionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @Post()
  create(
    @FarmId() farmId: string,
    @Body(new ZodValidationPipe(createTransactionBodySchema))
    data: CreateTransactionBodyDto,
  ) {
    void farmId;
    void data;
    throwDeprecatedWriteEndpoint('Transaction');
  }
}

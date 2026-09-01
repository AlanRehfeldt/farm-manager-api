import { Body, Controller, Post } from '@nestjs/common';
import { throwDeprecatedWriteEndpoint } from 'src/common/http/deprecated-endpoint';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { CreateInstallmentBodyDto } from '../dtos/request/create-installment.dto';
import { CreateInstallmentResponseDto } from '../dtos/response/create-installment.dto';
import { CreateInstallmentService } from '../services/create-installment.service';

const createInstallmentBodySchema = z.object({
  valueInCents: z.coerce
    .number()
    .min(0, { message: 'Value in cents must be at least 5 characters long.' }),
  dueDate: z.date(),
  paymentDate: z.date().optional(),
  paymentForm: z.enum([
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
  ]),
  transactionId: z.uuid(),
});

@ApiTags('Installment')
@FarmScoped()
@Controller('/installments')
export class CreateInstallmentController {
  constructor(
    private readonly createInstallmentService: CreateInstallmentService,
  ) {}

  @ApiOperation({ summary: 'Create installment' })
  @ApiCreatedResponse({
    description: 'Installment created successfully',
    type: CreateInstallmentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Transaction does not exist',
    type: NotFoundDto,
  })
  @Post()
  create(
    @FarmId() farmId: string,
    @Body(new ZodValidationPipe(createInstallmentBodySchema))
    data: CreateInstallmentBodyDto,
  ) {
    void farmId;
    void data;
    throwDeprecatedWriteEndpoint('Installment');
  }
}

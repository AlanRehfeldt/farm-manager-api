import { Body, Controller, Param, Put } from '@nestjs/common';
import { throwDeprecatedWriteEndpoint } from 'src/common/http/deprecated-endpoint';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import {
  UpdateInstallmentBodyDto,
  UpdateInstallmentParamDto,
} from '../dtos/request/update-installment.dto';
import { UpdateInstallmentResponseDto } from '../dtos/response/update-installment.dto';
import { UpdateInstallmentService } from '../services/update-installment.service';

const updateInstallmentParamSchema = z.object({
  id: z.uuid(),
});

const updateInstallmentSchema = z.object({
  valueInCents: z.coerce
    .number()
    .min(0, { message: 'Value in cents must be at least 5 characters long.' })
    .optional(),
  dueDate: z.date().optional(),
  paymentDate: z.date().optional(),
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
});

@ApiTags('Installment')
@FarmScoped()
@Controller('/installments')
export class UpdateInstallmentController {
  constructor(
    private readonly updateInstallmentService: UpdateInstallmentService,
  ) {}

  @ApiOperation({ summary: 'Update installment' })
  @ApiOkResponse({
    description: 'Installment updated successfully',
    type: UpdateInstallmentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Installment does not exist',
    type: NotFoundDto,
  })
  @Put(':id')
  update(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(updateInstallmentParamSchema))
    param: UpdateInstallmentParamDto,
    @Body(new ZodValidationPipe(updateInstallmentSchema))
    data: UpdateInstallmentBodyDto,
  ) {
    void farmId;
    void param;
    void data;
    throwDeprecatedWriteEndpoint('Installment');
  }
}

import { Body, Controller, HttpStatus, Param, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { UpdateInstallmentService } from '../services/update-installment.service';
import { UpdateInstallmentResponseDto } from '../dtos/response/update-installment.dto';
import {
  UpdateInstallmentBodyDto,
  UpdateInstallmentParamDto,
} from '../dtos/request/update-installment.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';

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
@Controller('/installments')
export class UpdateInstallmentController {
  constructor(
    private readonly updateInstallmentService: UpdateInstallmentService,
  ) {}

  @ApiOperation({ summary: 'Update installment' })
  @ApiCreatedResponse({
    description: 'Installment updated successfully',
    type: UpdateInstallmentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Registration already exists',
    type: ConflictDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Installment does not exist',
    type: NotFoundDto,
  })
  @Put(':id')
  async update(
    @Param(new ZodValidationPipe(updateInstallmentParamSchema))
    param: UpdateInstallmentParamDto,
    @Body(new ZodValidationPipe(updateInstallmentSchema))
    data: UpdateInstallmentBodyDto,
  ) {
    try {
      const { installment } = await this.updateInstallmentService.execute({
        id: param.id,
        ...data,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Installment updated successfully',
        installment,
      };
    } catch (error) {
      console.error('Error updating installment', error);
      throw error;
    }
  }
}

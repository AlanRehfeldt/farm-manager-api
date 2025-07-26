import { Body, Controller, HttpStatus, Post, UsePipes } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { CreateInstallmentService } from '../services/create-installment.service';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { CreateInstallmentResponseDto } from '../dtos/response/create-installment.dto';
import { CreateInstallmentBodyDto } from '../dtos/request/create-installment.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';

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
  @UsePipes(new ZodValidationPipe(createInstallmentBodySchema))
  async create(@Body() data: CreateInstallmentBodyDto) {
    try {
      const { installment } = await this.createInstallmentService.execute(data);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Installment created successfully',
        result: installment,
      };
    } catch (error) {
      console.error('Error creating installment', error);
      throw error;
    }
  }
}

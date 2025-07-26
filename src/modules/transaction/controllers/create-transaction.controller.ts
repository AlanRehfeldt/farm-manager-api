import { Body, Controller, HttpStatus, Post, UsePipes } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { CreateTransactionService } from '../services/create-transaction.service';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { CreateTransactionResponseDto } from '../dtos/response/create-transaction.dto';
import { CreateTransactionBodyDto } from '../dtos/request/create-transaction.dto';
import z from 'zod';

const createTransactionBodySchema = z.object({
  type: z.enum(['PURCHASE_INPUT', 'SALARY_PAYMENT', 'GENERIC']),
  date: z.date(),
  note: z.string().optional(),
});

@ApiTags('Transaction')
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
  @UsePipes(new ZodValidationPipe(createTransactionBodySchema))
  async create(@Body() data: CreateTransactionBodyDto) {
    try {
      const { transaction } = await this.createTransactionService.execute(data);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Transaction created successfully',
        result: transaction,
      };
    } catch (error) {
      console.error('Error creating transaction', error);
      throw error;
    }
  }
}

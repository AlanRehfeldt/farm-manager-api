import { Body, Controller, HttpStatus, Param, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { UpdateTransactionService } from '../services/update-transaction.service';
import { UpdateTransactionResponseDto } from '../dtos/response/update-transaction.dto';
import {
  UpdateTransactionBodyDto,
  UpdateTransactionParamDto,
} from '../dtos/request/update-transaction.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';

const updateTransactionParamSchema = z.object({
  id: z.uuid(),
});

const updateTransactionSchema = z.object({
  type: z.enum(['PURCHASE_INPUT', 'SALARY_PAYMENT', 'GENERIC']).optional(),
  date: z.date().optional(),
  note: z.string().optional(),
});

@ApiTags('Transaction')
@Controller('/transactions')
export class UpdateTransactionController {
  constructor(
    private readonly updateTransactionService: UpdateTransactionService,
  ) {}

  @ApiOperation({ summary: 'Update transaction' })
  @ApiCreatedResponse({
    description: 'Transaction updated successfully',
    type: UpdateTransactionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Transaction does not exist',
    type: NotFoundDto,
  })
  @Put(':id')
  async update(
    @Param(new ZodValidationPipe(updateTransactionParamSchema))
    param: UpdateTransactionParamDto,
    @Body(new ZodValidationPipe(updateTransactionSchema))
    data: UpdateTransactionBodyDto,
  ) {
    try {
      const { transaction } = await this.updateTransactionService.execute({
        id: param.id,
        ...data,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Transaction updated successfully',
        transaction,
      };
    } catch (error) {
      console.error('Error updating transaction', error);
      throw error;
    }
  }
}

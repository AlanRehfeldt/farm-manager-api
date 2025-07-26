import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { GetTransactionService } from '../services/get-transaction.service';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { GetTransactionParamDto } from '../dtos/request/get-transaction.dto';
import { GetTransactionResponseDto } from '../dtos/response/get-transaction.dto';

const getTransactionParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Transaction')
@Controller('/transactions')
export class GetTransactionController {
  constructor(private readonly getTransactionService: GetTransactionService) {}

  @ApiOperation({ summary: 'Get transaction' })
  @ApiOkResponse({
    description: 'Transaction retrived successfully',
    type: GetTransactionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Transaction does not exist',
    type: NotFoundDto,
  })
  @Get(':id')
  async get(
    @Param(new ZodValidationPipe(getTransactionParamSchema))
    param: GetTransactionParamDto,
  ) {
    try {
      const { transaction } = await this.getTransactionService.execute(
        param.id,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Transaction retrived successfully',
        transaction,
      };
    } catch (error) {
      console.error('Error getting transaction', error);
      throw error;
    }
  }
}

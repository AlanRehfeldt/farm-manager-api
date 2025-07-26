import { Controller, Delete, HttpStatus, Param } from '@nestjs/common';
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
import { DeleteTransactionService } from '../services/delete-transaction.service';
import { DeleteTransactionParamDto } from '../dtos/request/delete-transaction.dto';
import { DeleteTransactionResponseDto } from '../dtos/response/delete-transaction.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';

const deleteTransactionParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Transaction')
@Controller('/transactions')
export class DeleteTransactionController {
  constructor(
    private readonly deleteTransactionService: DeleteTransactionService,
  ) {}

  @ApiOperation({ summary: 'Delete transaction' })
  @ApiCreatedResponse({
    description: 'Transaction deleted successfully',
    type: DeleteTransactionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Transaction does not exist',
    type: NotFoundDto,
  })
  @Delete(':id')
  async delete(
    @Param(new ZodValidationPipe(deleteTransactionParamSchema))
    param: DeleteTransactionParamDto,
  ) {
    try {
      await this.deleteTransactionService.execute(param.id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Transaction deleted successfully',
        result: null,
      };
    } catch (error) {
      console.error('Error deleting transaction', error);
      throw error;
    }
  }
}

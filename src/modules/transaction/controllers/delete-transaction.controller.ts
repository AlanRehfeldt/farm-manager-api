import { Controller, Delete, HttpStatus, Param } from '@nestjs/common';
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
import { DeleteTransactionParamDto } from '../dtos/request/delete-transaction.dto';
import { DeleteTransactionResponseDto } from '../dtos/response/delete-transaction.dto';
import { DeleteTransactionService } from '../services/delete-transaction.service';

const deleteTransactionParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Transaction')
@FarmScoped()
@Controller('/transactions')
export class DeleteTransactionController {
  constructor(
    private readonly deleteTransactionService: DeleteTransactionService,
  ) {}

  @ApiOperation({ summary: 'Delete transaction' })
  @ApiOkResponse({
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
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(deleteTransactionParamSchema))
    param: DeleteTransactionParamDto,
  ) {
    await this.deleteTransactionService.execute(param.id, farmId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Transaction deleted successfully',
      result: null,
    };
  }
}

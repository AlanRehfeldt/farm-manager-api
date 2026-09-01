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
  UpdateTransactionBodyDto,
  UpdateTransactionParamDto,
} from '../dtos/request/update-transaction.dto';
import { UpdateTransactionResponseDto } from '../dtos/response/update-transaction.dto';
import { UpdateTransactionService } from '../services/update-transaction.service';

const updateTransactionParamSchema = z.object({
  id: z.uuid(),
});

const updateTransactionSchema = z.object({
  type: z.enum(['PURCHASE_INPUT', 'SALARY_PAYMENT', 'GENERIC']).optional(),
  date: z.date().optional(),
  note: z.string().optional(),
});

@ApiTags('Transaction')
@FarmScoped()
@Controller('/transactions')
export class UpdateTransactionController {
  constructor(
    private readonly updateTransactionService: UpdateTransactionService,
  ) {}

  @ApiOperation({ summary: 'Update transaction' })
  @ApiOkResponse({
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
  update(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(updateTransactionParamSchema))
    param: UpdateTransactionParamDto,
    @Body(new ZodValidationPipe(updateTransactionSchema))
    data: UpdateTransactionBodyDto,
  ) {
    void farmId;
    void param;
    void data;
    throwDeprecatedWriteEndpoint('Transaction');
  }
}

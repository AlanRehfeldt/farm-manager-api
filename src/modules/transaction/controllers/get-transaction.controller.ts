import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
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
import { GetTransactionParamDto } from '../dtos/request/get-transaction.dto';
import { GetTransactionResponseDto } from '../dtos/response/get-transaction.dto';
import { GetTransactionService } from '../services/get-transaction.service';

const getTransactionParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Transaction')
@FarmScoped()
@Controller('/transactions')
export class GetTransactionController {
  constructor(private readonly getTransactionService: GetTransactionService) {}

  @ApiOperation({ summary: 'Get transaction' })
  @ApiOkResponse({
    description: 'Transaction retrieved successfully',
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
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(getTransactionParamSchema))
    param: GetTransactionParamDto,
  ) {
    const { transaction } = await this.getTransactionService.execute(
      param.id,
      farmId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Transaction retrieved successfully',
      result: transaction,
    };
  }
}

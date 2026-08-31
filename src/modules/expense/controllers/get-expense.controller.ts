import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { GetExpenseResponseDto } from '../dtos/response/expense-response.dto';
import { GetExpenseService } from '../services/get-expense.service';

const idSchema = z.object({ id: z.uuid() });

@ApiTags('Expense')
@FarmScoped()
@Controller('/expenses')
export class GetExpenseController {
  constructor(private readonly getExpenseService: GetExpenseService) {}

  @ApiOperation({ summary: 'Get expense by id' })
  @ApiOkResponse({
    description: 'Expense retrieved successfully',
    type: GetExpenseResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Expense does not exist',
    type: NotFoundDto,
  })
  @Get('/:id')
  async get(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(idSchema)) params: { id: string },
  ) {
    const { expense } = await this.getExpenseService.execute({
      id: params.id,
      farmId,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Expense retrieved successfully',
      result: expense,
    };
  }
}

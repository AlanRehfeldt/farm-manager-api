import { Body, Controller, HttpStatus, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmAdmin } from 'src/common/tenancy/farm-admin.decorator';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ForbiddenDto } from 'src/common/errors/forbidden.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { GetExpenseResponseDto } from '../dtos/response/expense-response.dto';
import { ReverseExpenseService } from '../services/reverse-expense.service';

const expenseIdSchema = z.object({
  id: z.uuid(),
});

const reverseExpenseBodySchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, { message: 'Reason must be at least 3 characters' })
    .max(500, { message: 'Reason must be at most 500 characters' }),
});

@ApiTags('Expense')
@FarmScoped()
@Controller('/expenses')
export class ReverseExpenseController {
  constructor(private readonly reverseExpenseService: ReverseExpenseService) {}

  @FarmAdmin()
  @ApiOperation({ summary: 'Reverse expense allocations (ADMIN)' })
  @ApiOkResponse({
    description: 'Expense reversed successfully',
    type: GetExpenseResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden: Farm admin access required',
    type: ForbiddenDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Expense does not exist',
    type: NotFoundDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Season closed, already reversed or no cost entries',
  })
  @Post(':id/reverse')
  async reverse(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(expenseIdSchema))
    params: { id: string },
    @Body(new ZodValidationPipe(reverseExpenseBodySchema))
    body: { reason: string },
  ) {
    const { expense } = await this.reverseExpenseService.execute({
      expenseId: params.id,
      farmId,
      reason: body.reason,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Expense reversed successfully',
      result: expense,
    };
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { MembershipRole } from 'src/common/tenancy/membership-role.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { FetchExpensesQueryDto } from '../dtos/request/expense.dto';
import { FetchExpensesResponseDto } from '../dtos/response/expense-response.dto';
import { FetchExpensesService } from '../services/fetch-expenses.service';

const fetchExpensesSchema = z.object({
  name: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('date'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('desc'),
});

@ApiTags('Expense')
@FarmScoped()
@Controller('/expenses')
export class FetchExpensesController {
  constructor(private readonly fetchExpensesService: FetchExpensesService) {}

  @ApiOperation({ summary: 'List generic expenses and salary payments' })
  @ApiOkResponse({
    description: 'Expenses retrieved successfully',
    type: FetchExpensesResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid query',
    type: BadRequestDto,
  })
  @Get()
  async fetch(
    @FarmId() farmId: string,
    @MembershipRole() membershipRole: import('@prisma/client').Role,
    @Query(new ZodValidationPipe(fetchExpensesSchema))
    query: FetchExpensesQueryDto,
  ) {
    return await this.fetchExpensesService.execute({
      farmId,
      membershipRole,
      name: query.name,
      page: query.page ?? 1,
      perPage: query.perPage ?? 10,
      orderBy: query.orderBy ?? 'date',
      orderDirection: (query.orderDirection ?? 'desc') as 'asc' | 'desc',
    });
  }
}

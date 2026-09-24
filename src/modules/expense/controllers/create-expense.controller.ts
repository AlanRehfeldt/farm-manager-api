import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import {
  AuthenticatedUser,
  CurrentUser,
} from 'src/modules/auth/decorators/current-user.decorator';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { MembershipRole } from 'src/common/tenancy/membership-role.decorator';
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { Idempotent } from 'src/common/idempotency';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { CreateExpenseBodyDto } from '../dtos/request/expense.dto';
import { CreateExpenseResponseDto } from '../dtos/response/expense-response.dto';
import { CreateExpenseService } from '../services/create-expense.service';

const paymentFormSchema = z.enum([
  'CASH',
  'CREDIT_CARD',
  'DEBIT_CARD',
  'BANK_SLIP',
  'TRANSFER',
  'PIX',
  'CHECK',
  'DIGITAL_WALLET',
  'LOAN',
  'TRADE',
  'FINANCING',
  'OTHER',
]);

const genericSubtypeSchema = z.enum([
  'GENERAL_EXPENSE',
  'FIXED_ASSET_EXPENSE',
  'LOAN_PAYMENT',
  'SERVICE_PAYMENT',
  'TAX_PAYMENT',
  'SUPPLIER_ADVANCE',
  'RENTAL_PAYMENT',
  'PROFIT_DISTRIBUTION',
  'INSURANCE_EXPENSE',
  'LOSS_OR_FINE',
  'PROJECT_INVESTMENT',
  'BANK_FEE',
  'OTHER',
]);

const createExpenseBodySchema = z
  .object({
    type: z.enum(['GENERIC', 'SALARY_PAYMENT']),
    date: z.coerce.date(),
    note: z.string().optional(),
    generic: z.object({ subtype: genericSubtypeSchema }).optional(),
    salary: z.object({ employeeId: z.uuid() }).optional(),
    installments: z
      .array(
        z.object({
          valueInCents: z.coerce.number().int().positive(),
          dueDate: z.coerce.date(),
          paymentDate: z.coerce.date().optional(),
          paymentForm: paymentFormSchema,
        }),
      )
      .min(1),
    allocations: z
      .array(
        z.object({
          farmId: z.uuid().optional(),
          costCenterId: z.uuid(),
          accountPlanId: z.uuid(),
          costCategoryId: z.uuid(),
          cropSeasonId: z.uuid(),
          fieldId: z.uuid().optional(),
          fieldIds: z.array(z.uuid()).optional(),
          allocatedValueInCents: z.coerce.number().int().positive().optional(),
        }),
      )
      .min(1),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'GENERIC' && !data.generic?.subtype) {
      ctx.addIssue({
        code: 'custom',
        message: 'Generic expense requires subtype',
        path: ['generic', 'subtype'],
      });
    }
    if (data.type === 'SALARY_PAYMENT' && !data.salary?.employeeId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Salary payment requires employeeId',
        path: ['salary', 'employeeId'],
      });
    }

    const withValue = data.allocations.filter(
      (a) => a.allocatedValueInCents !== undefined,
    );
    const withoutValue = data.allocations.filter(
      (a) => a.allocatedValueInCents === undefined,
    );
    if (withValue.length > 0 && withoutValue.length > 0) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Cannot mix allocations with and without allocatedValueInCents',
        path: ['allocations'],
      });
    }

    for (let i = 0; i < data.allocations.length; i++) {
      const allocation = data.allocations[i];
      if (
        allocation.fieldId &&
        allocation.fieldIds &&
        allocation.fieldIds.length > 0
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'Cannot combine fieldId and fieldIds on the same allocation',
          path: ['allocations', i],
        });
      }
    }
  });

@ApiTags('Expense')
@FarmScoped()
@Controller('/expenses')
export class CreateExpenseController {
  constructor(private readonly createExpenseService: CreateExpenseService) {}

  @ApiOperation({
    summary: 'Create generic expense or salary with allocations',
  })
  @ApiCreatedResponse({
    description: 'Expense created successfully',
    type: CreateExpenseResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Related entity does not exist',
    type: NotFoundDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Season closed or double count blocked',
    type: ConflictDto,
  })
  @Post()
  @Idempotent()
  async create(
    @OrganizationId() organizationId: string,
    @FarmId() farmId: string,
    @CurrentUser() user: AuthenticatedUser,
    @MembershipRole() membershipRole: import('@prisma/client').Role,
    @Body(new ZodValidationPipe(createExpenseBodySchema))
    data: CreateExpenseBodyDto,
  ) {
    const { expense } = await this.createExpenseService.execute({
      ...data,
      organizationId,
      payerFarmId: farmId,
      userId: user.userId,
      membershipRole,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Expense created successfully',
      result: expense,
    };
  }
}

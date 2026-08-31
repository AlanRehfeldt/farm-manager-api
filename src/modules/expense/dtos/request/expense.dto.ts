import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const paymentForms = [
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
] as const;

const genericSubtypes = [
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
] as const;

export class CreateExpenseInstallmentBodyDto {
  @ApiProperty({ example: 500000 })
  valueInCents!: number;

  @ApiProperty()
  dueDate!: Date;

  @ApiPropertyOptional()
  paymentDate?: Date;

  @ApiProperty({ enum: paymentForms })
  paymentForm!: (typeof paymentForms)[number];
}

export class CreateExpenseAllocationBodyDto {
  @ApiProperty()
  costCenterId!: string;

  @ApiProperty()
  accountPlanId!: string;

  @ApiProperty()
  costCategoryId!: string;

  @ApiProperty()
  cropSeasonId!: string;

  @ApiPropertyOptional()
  fieldId?: string;

  @ApiProperty({ example: 500000 })
  allocatedValueInCents!: number;
}

export class CreateExpenseGenericBodyDto {
  @ApiProperty({ enum: genericSubtypes })
  subtype!: (typeof genericSubtypes)[number];
}

export class CreateExpenseSalaryBodyDto {
  @ApiProperty()
  employeeId!: string;
}

export class CreateExpenseBodyDto {
  @ApiProperty({ enum: ['GENERIC', 'SALARY_PAYMENT'] })
  type!: 'GENERIC' | 'SALARY_PAYMENT';

  @ApiProperty()
  date!: Date;

  @ApiPropertyOptional()
  note?: string;

  @ApiPropertyOptional({ type: CreateExpenseGenericBodyDto })
  generic?: CreateExpenseGenericBodyDto;

  @ApiPropertyOptional({ type: CreateExpenseSalaryBodyDto })
  salary?: CreateExpenseSalaryBodyDto;

  @ApiProperty({ type: [CreateExpenseInstallmentBodyDto] })
  installments!: CreateExpenseInstallmentBodyDto[];

  @ApiProperty({ type: [CreateExpenseAllocationBodyDto] })
  allocations!: CreateExpenseAllocationBodyDto[];
}

export class FetchExpensesQueryDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional({ default: 1 })
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  perPage?: number;

  @ApiPropertyOptional({ default: 'date' })
  orderBy?: string;

  @ApiPropertyOptional({ default: 'desc' })
  orderDirection?: string;
}

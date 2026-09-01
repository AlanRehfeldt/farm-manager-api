import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class ExpenseInstallmentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  valueInCents!: number;

  @ApiProperty()
  dueDate!: Date;

  @ApiProperty({ nullable: true })
  paymentDate!: Date | null;

  @ApiProperty()
  paymentForm!: string;
}

export class ExpenseCostEntryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ nullable: true })
  fieldId!: string | null;

  @ApiProperty({ nullable: true })
  fieldName!: string | null;

  @ApiProperty()
  costCategoryCode!: string;

  @ApiProperty()
  costCategoryName!: string;

  @ApiProperty()
  amountInCents!: number;
}

export class ExpenseAllocationDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  costCenterId!: string;

  @ApiProperty()
  costCenterName!: string;

  @ApiProperty()
  accountPlanId!: string;

  @ApiProperty()
  accountPlanName!: string;

  @ApiProperty()
  costCategoryId!: string;

  @ApiProperty()
  costCategoryCode!: string;

  @ApiProperty()
  costCategoryName!: string;

  @ApiProperty()
  cropSeasonId!: string;

  @ApiProperty()
  cropSeasonName!: string;

  @ApiProperty({ nullable: true })
  fieldId!: string | null;

  @ApiProperty({ nullable: true })
  fieldName!: string | null;

  @ApiProperty()
  allocatedValueInCents!: number;

  @ApiProperty({ type: [ExpenseCostEntryDto] })
  costEntries!: ExpenseCostEntryDto[];
}

export class ExpenseEmployeeDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

export class ExpenseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  farmId!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  date!: Date;

  @ApiProperty({ nullable: true })
  note!: string | null;

  @ApiProperty({ nullable: true })
  genericSubtype!: string | null;

  @ApiProperty({ type: ExpenseEmployeeDto, nullable: true })
  employee!: ExpenseEmployeeDto | null;

  @ApiProperty({ type: [ExpenseInstallmentDto] })
  installments!: ExpenseInstallmentDto[];

  @ApiProperty({ type: [ExpenseAllocationDto] })
  allocations!: ExpenseAllocationDto[];

  @ApiProperty()
  totalInCents!: number;

  @ApiProperty({ nullable: true })
  reversedAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class CreateExpenseResponseDto {
  @ApiProperty({ example: HttpStatus.CREATED })
  statusCode!: number;

  @ApiProperty()
  message!: string;

  @ApiProperty({ type: ExpenseDto })
  result!: ExpenseDto;
}

export class GetExpenseResponseDto {
  @ApiProperty({ example: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty()
  message!: string;

  @ApiProperty({ type: ExpenseDto })
  result!: ExpenseDto;
}

export class FetchExpensesResponseDto {
  @ApiProperty({ type: [ExpenseDto] })
  results!: ExpenseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  perPage!: number;

  @ApiProperty()
  orderBy!: string;

  @ApiProperty()
  orderDirection!: string;
}

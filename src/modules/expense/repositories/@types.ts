import {
  CostCategory,
  CostCenter,
  AccountPlan,
  CropSeason,
  Employee,
  Field,
  GenericTransactionDetails,
  GenericTransactionSubtype,
  Installment,
  PaymentForm,
  SalaryTransaction,
  Transaction,
  TransactionAllocation,
  TransactionType,
  CostEntry,
} from '@prisma/client';

export type ExpenseInstallmentInput = {
  valueInCents: number;
  dueDate: Date;
  paymentDate?: Date | null;
  paymentForm: PaymentForm;
};

export type ExpenseAllocationInput = {
  costCenterId: string;
  accountPlanId: string;
  costCategoryId: string;
  cropSeasonId: string;
  fieldId?: string | null;
  allocatedValueInCents: number;
};

export type PlantingAreaMeta = {
  fieldId: string;
  areaHa: string;
};

export type CreateExpenseData = {
  farmId: string;
  type: TransactionType;
  date: Date;
  note?: string | null;
  genericSubtype?: GenericTransactionSubtype;
  employeeId?: string;
  installments: ExpenseInstallmentInput[];
  allocations: ExpenseAllocationInput[];
  plantingAreasBySeason: Record<string, PlantingAreaMeta[]>;
};

export type CostEntrySummary = CostEntry & {
  costCategory: Pick<CostCategory, 'id' | 'code' | 'name'>;
  field: Pick<Field, 'id' | 'name'> | null;
};

export type AllocationWithRelations = TransactionAllocation & {
  costCenter: Pick<CostCenter, 'id' | 'name' | 'code'>;
  accountPlan: Pick<AccountPlan, 'id' | 'name' | 'code'>;
  costCategory: Pick<CostCategory, 'id' | 'code' | 'name'>;
  cropSeason: Pick<CropSeason, 'id' | 'name' | 'status'>;
  field: Pick<Field, 'id' | 'name'> | null;
  costEntries: CostEntrySummary[];
};

export type ExpenseWithRelations = Transaction & {
  installments: Installment[];
  transactionAllocations: AllocationWithRelations[];
  salaryTransaction:
    | (SalaryTransaction & {
        employee: Pick<Employee, 'id' | 'name'>;
      })
    | null;
  genericDetails: GenericTransactionDetails | null;
};

export type CreateExpenseResult = {
  expense: ExpenseWithRelations;
};

export type ReverseExpenseData = {
  expenseId: string;
  farmId: string;
  reason: string;
  reversedAt: Date;
};

export type ReverseExpenseResult = {
  expense: ExpenseWithRelations;
};

export type SearchManyExpensesQuery = {
  farmId: string;
  name?: string;
  excludeTypes?: TransactionType[];
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
};

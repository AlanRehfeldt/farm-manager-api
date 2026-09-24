import {
  CostCategory,
  CostCenter,
  AccountPlan,
  CropSeason,
  Employee,
  Farm,
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

/** Payload bruto do cliente (antes da resolução no service). */
export type ExpenseAllocationInput = {
  farmId?: string | null;
  costCenterId: string;
  accountPlanId: string;
  costCategoryId: string;
  cropSeasonId: string;
  /** Compat PR-12: um talhão. */
  fieldId?: string | null;
  /** PR-29: subset de talhões; omitir = todos os plantios da safra. */
  fieldIds?: string[];
  /** Compat: valor explícito. Omitir em todas = rateio PR-29 do total. */
  allocatedValueInCents?: number;
};

export type ResolvedCostEntrySplit = {
  farmId: string;
  cropSeasonId: string;
  fieldId: string;
  amountInCents: bigint;
  costCategoryId: string;
};

/** Alocação pronta para persistir (uma por safra destino). */
export type ResolvedExpenseAllocation = {
  farmId: string;
  costCenterId: string;
  accountPlanId: string;
  costCategoryId: string;
  cropSeasonId: string;
  /** Preenchido só quando o destino resolve a um único talhão. */
  fieldId: string | null;
  allocatedValueInCents: bigint;
  costEntries: ResolvedCostEntrySplit[];
};

export type CreateExpenseData = {
  farmId: string;
  type: TransactionType;
  date: Date;
  note?: string | null;
  genericSubtype?: GenericTransactionSubtype;
  employeeId?: string;
  installments: ExpenseInstallmentInput[];
  allocations: ResolvedExpenseAllocation[];
};

export type CostEntrySummary = CostEntry & {
  costCategory: Pick<CostCategory, 'id' | 'code' | 'name'>;
  field: Pick<Field, 'id' | 'name'> | null;
};

export type AllocationWithRelations = TransactionAllocation & {
  farm: Pick<Farm, 'id' | 'name'>;
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

import { bigintToNumber } from 'src/common/serialization/money';
import { ExpenseWithRelations } from '../repositories/@types';

export type ExpenseInstallmentResponse = {
  id: string;
  valueInCents: number;
  dueDate: Date;
  paymentDate: Date | null;
  paymentForm: string;
};

export type ExpenseCostEntryResponse = {
  id: string;
  fieldId: string | null;
  fieldName: string | null;
  costCategoryCode: string;
  costCategoryName: string;
  amountInCents: number;
};

export type ExpenseAllocationResponse = {
  id: string;
  costCenterId: string;
  costCenterName: string;
  accountPlanId: string;
  accountPlanName: string;
  costCategoryId: string;
  costCategoryCode: string;
  costCategoryName: string;
  cropSeasonId: string;
  cropSeasonName: string;
  fieldId: string | null;
  fieldName: string | null;
  allocatedValueInCents: number;
  costEntries: ExpenseCostEntryResponse[];
};

export type ExpenseResponse = {
  id: string;
  farmId: string;
  type: string;
  date: Date;
  note: string | null;
  genericSubtype: string | null;
  employee: { id: string; name: string } | null;
  installments: ExpenseInstallmentResponse[];
  allocations: ExpenseAllocationResponse[];
  totalInCents: number;
  createdAt: Date;
  updatedAt: Date;
};

export function toExpenseResponse(
  expense: ExpenseWithRelations,
): ExpenseResponse {
  const installments = expense.installments.map((inst) => ({
    id: inst.id,
    valueInCents: bigintToNumber(inst.valueInCents)!,
    dueDate: inst.dueDate,
    paymentDate: inst.paymentDate,
    paymentForm: inst.paymentForm,
  }));

  const allocations = expense.transactionAllocations.map((allocation) => ({
    id: allocation.id,
    costCenterId: allocation.costCenterId,
    costCenterName: allocation.costCenter.name,
    accountPlanId: allocation.accountPlanId,
    accountPlanName: allocation.accountPlan.name,
    costCategoryId: allocation.costCategoryId,
    costCategoryCode: allocation.costCategory.code,
    costCategoryName: allocation.costCategory.name,
    cropSeasonId: allocation.cropSeasonId,
    cropSeasonName: allocation.cropSeason.name,
    fieldId: allocation.fieldId,
    fieldName: allocation.field?.name ?? null,
    allocatedValueInCents: bigintToNumber(allocation.allocatedValueInCents)!,
    costEntries: allocation.costEntries.map((entry) => ({
      id: entry.id,
      fieldId: entry.fieldId,
      fieldName: entry.field?.name ?? null,
      costCategoryCode: entry.costCategory.code,
      costCategoryName: entry.costCategory.name,
      amountInCents: bigintToNumber(entry.amountInCents)!,
    })),
  }));

  const totalInCents = allocations.reduce(
    (sum, allocation) => sum + allocation.allocatedValueInCents,
    0,
  );

  return {
    id: expense.id,
    farmId: expense.farmId,
    type: expense.type,
    date: expense.date,
    note: expense.note,
    genericSubtype: expense.genericDetails?.subtype ?? null,
    employee: expense.salaryTransaction
      ? {
          id: expense.salaryTransaction.employee.id,
          name: expense.salaryTransaction.employee.name,
        }
      : null,
    installments,
    allocations,
    totalInCents,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
  };
}

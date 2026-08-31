import {
  Activity,
  ActivityInput,
  ActivityLabor,
  ActivityMachineHour,
  ActivityType,
  CostEntry,
  CropSeason,
  Field,
  LaborPayBasis,
} from '@prisma/client';

export type ActivityInputData = {
  productId: string;
  quantity: string;
};

export type ActivityLaborData = {
  employeeId?: string;
  contractorName?: string;
  payBasis: LaborPayBasis;
  hours?: string;
  days?: string;
  outputQty?: string;
  costInCents: number;
};

export type ActivityMachineHourData = {
  machineId: string;
  hours: string;
};

export type ProductMeta = {
  name: string;
  uomAcronym: string;
  uomId: string;
};

export type MachineMeta = {
  name: string;
  hourlyCostInCents: bigint;
};

export type EmployeeMeta = {
  name: string;
};

export type CostCategoryIds = {
  defaultInput: string;
  moFixa: string;
  moTemporaria: string;
  maquina: string;
};

export type CreateActivityData = {
  farmId: string;
  cropSeasonId: string;
  fieldId: string;
  activityType: ActivityType;
  date: Date;
  note?: string | null;
  createdByUserId: string;
  inputs: ActivityInputData[];
  labor: ActivityLaborData[];
  machineHours: ActivityMachineHourData[];
  productMeta: Record<string, ProductMeta>;
  machineMeta: Record<string, MachineMeta>;
  employeeMeta: Record<string, EmployeeMeta>;
  costCategoryIds: CostCategoryIds;
};

export type ActivityStockEffect = {
  productName: string;
  quantity: string;
  uomAcronym: string;
  quantityRemaining: string;
  amountInCents: number;
};

export type ActivityInputWithProduct = ActivityInput & {
  product: {
    id: string;
    name: string;
    unitOfMeasurement: {
      id: string;
      acronym: string;
    };
  };
};

export type ActivityLaborWithEmployee = ActivityLabor & {
  employee: {
    id: string;
    name: string;
  } | null;
};

export type ActivityMachineHourWithMachine = ActivityMachineHour & {
  machine: {
    id: string;
    name: string;
  };
};

export type ActivityWithRelations = Activity & {
  field: Pick<Field, 'id' | 'name'>;
  cropSeason: CropSeason & {
    crop: {
      id: string;
      name: string;
    };
  };
  inputs: ActivityInputWithProduct[];
  labor: ActivityLaborWithEmployee[];
  machineHours: ActivityMachineHourWithMachine[];
  costEntries: CostEntry[];
};

export type CreateActivityResult = {
  activity: ActivityWithRelations;
  stockEffects: ActivityStockEffect[];
};

export type SearchManyActivitiesQuery = {
  farmId: string;
  cropSeasonId: string;
  name?: string;
  activityType?: ActivityType;
  dateFrom?: Date;
  dateTo?: Date;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
};

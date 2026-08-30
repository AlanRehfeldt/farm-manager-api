import {
  Activity,
  ActivityInput,
  ActivityType,
  CostEntry,
  CropSeason,
  Field,
} from '@prisma/client';

export type ActivityInputData = {
  productId: string;
  quantity: string;
};

export type ProductMeta = {
  name: string;
  uomAcronym: string;
  uomId: string;
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
  productMeta: Record<string, ProductMeta>;
  defaultCostCategoryId: string;
};

export type ActivityStockEffect = {
  productName: string;
  quantity: string;
  uomAcronym: string;
  quantityRemaining: string;
  amountInCents: number;
  insufficient: boolean;
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

export type ActivityWithRelations = Activity & {
  field: Pick<Field, 'id' | 'name'>;
  cropSeason: CropSeason & {
    crop: {
      id: string;
      name: string;
    };
  };
  inputs: ActivityInputWithProduct[];
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
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
};

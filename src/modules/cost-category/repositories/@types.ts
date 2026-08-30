export type SearchManyQuery = {
  organizationId: string;
  id?: string;
  name?: string;
  code?: string;
  page: number;
  perPage: number;
  orderBy: OrderableCostCategoryField;
  orderDirection: 'asc' | 'desc';
};

export type OrderableCostCategoryField =
  'name' | 'code' | 'createdAt' | 'updatedAt';

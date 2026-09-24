export type CreateFarmData = {
  organizationId: string;
  name: string;
  timezone?: string;
};

export interface UpdateFarmData {
  id: string;
  name?: string;
  timezone?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zipCode?: string | null;
}

export interface SearchManyQuery {
  name?: string;
  organizationId?: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}

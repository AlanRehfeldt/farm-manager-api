import { Organization } from '@prisma/client';

export interface UpdateOrganizationData {
  id: string;
  name?: string;
  cnpj?: string | null;
  phone?: string | null;
  email?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
}

export interface SearchManyQuery {
  id?: string;
  name?: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}

export type OrganizationRecord = Organization;

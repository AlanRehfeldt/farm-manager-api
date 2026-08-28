import { Organization } from '@prisma/client';

export type CreateOrganizationData = {
  name: string;
  ownerUserId: string;
};

export interface UpdateOrganizationData {
  id: string;
  name?: string;
}

export interface SearchManyQuery {
  name?: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}

export type OrganizationRecord = Organization;

import { Organization } from '@prisma/client';

export type CreateOrganizationData = {
  name: string;
  ownerUserId: string;
};

export type CreateOrganizationWithFirstFarmData = {
  organizationName: string;
  farmName: string;
  timezone?: string;
  ownerUserId: string;
};

export type OrganizationWithFirstFarmResult = {
  organization: Organization;
  farm: {
    id: string;
    organizationId: string;
    name: string;
    timezone: string | null;
    street: string | null;
    number: string | null;
    complement: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    zipCode: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

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
  name?: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}

export type OrganizationRecord = Organization;

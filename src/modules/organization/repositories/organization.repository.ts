import { Organization } from '@prisma/client';
import {
  CreateOrganizationData,
  CreateOrganizationWithFirstFarmData,
  OrganizationWithFirstFarmResult,
  SearchManyQuery,
  UpdateOrganizationData,
} from './@types';

export interface OrganizationRepository {
  createWithOwner(data: CreateOrganizationData): Promise<Organization>;
  createWithOwnerAndFirstFarm(
    data: CreateOrganizationWithFirstFarmData,
  ): Promise<OrganizationWithFirstFarmResult>;
  update(data: UpdateOrganizationData): Promise<Organization>;
  findByIdForUser(id: string, userId: string): Promise<Organization | null>;
  searchManyForUser(
    userId: string,
    query: SearchManyQuery,
  ): Promise<Organization[]>;
  countForUser(userId: string, query: SearchManyQuery): Promise<number>;
}

export const ORGANIZATION_REPOSITORY = 'ORGANIZATION_REPOSITORY';

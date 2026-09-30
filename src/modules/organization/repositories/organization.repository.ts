import { Organization } from '@prisma/client';
import { SearchManyQuery, UpdateOrganizationData } from './@types';

export interface OrganizationRepository {
  update(data: UpdateOrganizationData): Promise<Organization>;
  findByIdForUser(id: string, userId: string): Promise<Organization | null>;
  searchManyForUser(
    userId: string,
    query: SearchManyQuery,
  ): Promise<Organization[]>;
  countForUser(userId: string, query: SearchManyQuery): Promise<number>;
}

export const ORGANIZATION_REPOSITORY = 'ORGANIZATION_REPOSITORY';

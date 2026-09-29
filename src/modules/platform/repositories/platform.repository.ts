import { Farm, Organization } from '@prisma/client';
import {
  PlatformOrganizationListItem,
  PlatformUserListItem,
  ProvisionOrganizationData,
  ProvisionOrganizationResult,
  SearchPlatformOrganizationFarmsQuery,
  SearchPlatformOrganizationsQuery,
  SearchPlatformUsersQuery,
} from './@types';

export interface PlatformRepository {
  provisionOrganization(
    data: ProvisionOrganizationData,
  ): Promise<ProvisionOrganizationResult>;
  findOrganizationById(id: string): Promise<Organization | null>;
  searchOrganizationFarms(
    query: SearchPlatformOrganizationFarmsQuery,
  ): Promise<Farm[]>;
  countOrganizationFarms(
    query: SearchPlatformOrganizationFarmsQuery,
  ): Promise<number>;
  searchOrganizations(
    query: SearchPlatformOrganizationsQuery,
  ): Promise<PlatformOrganizationListItem[]>;
  countOrganizations(query: SearchPlatformOrganizationsQuery): Promise<number>;
  searchUsers(query: SearchPlatformUsersQuery): Promise<PlatformUserListItem[]>;
  countUsers(query: SearchPlatformUsersQuery): Promise<number>;
  resetUserPassword(userId: string, passwordHash: string): Promise<boolean>;
}

export const PLATFORM_REPOSITORY = 'PLATFORM_REPOSITORY';

import {
  Farm,
  Organization,
  OrganizationStatus,
  SupportAccess,
} from '@prisma/client';
import {
  ActiveSupportAccess,
  AuditLogListItem,
  AdoptionSummary,
  PlatformOrganizationListItem,
  PlatformOrganizationUsage,
  PlatformUserListItem,
  UpdatePlatformOrganizationProfile,
  ProvisionOrganizationData,
  ProvisionOrganizationResult,
  SearchAuditLogsQuery,
  SearchPlatformOrganizationFarmsQuery,
  SearchPlatformOrganizationsQuery,
  SearchPlatformUsersQuery,
  SearchSupportAccessQuery,
  SearchSupportUsersQuery,
  SupportAccessListItem,
  SupportUserListItem,
} from './@types';

export interface PlatformRepository {
  provisionOrganization(
    data: ProvisionOrganizationData,
    actorUserId: string,
  ): Promise<ProvisionOrganizationResult>;
  findOrganizationById(id: string): Promise<Organization | null>;
  organizationUsage(
    organizationId: string,
    since: Date,
  ): Promise<PlatformOrganizationUsage>;
  updateOrganizationProfile(
    organizationId: string,
    data: UpdatePlatformOrganizationProfile,
    actorUserId: string,
  ): Promise<Organization | null>;
  removeOrganizationMember(input: {
    actorUserId: string;
    organizationId: string;
    userId: string;
    guardLastOrgAdmin: boolean;
  }): Promise<void>;
  adoptionSummary(now: Date): Promise<AdoptionSummary>;
  updateOrganizationStatus(
    organizationId: string,
    status: OrganizationStatus,
    actorUserId: string,
  ): Promise<Organization | null>;
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
  resetUserPassword(
    userId: string,
    passwordHash: string,
    actorUserId: string,
  ): Promise<boolean>;
  createSupportUser(data: {
    name: string;
    email: string;
    passwordHash: string;
    actorUserId: string;
  }): Promise<SupportUserListItem>;
  grantSupportAccess(data: {
    userId: string;
    organizationId: string;
    grantedByUserId: string;
  }): Promise<SupportAccess>;
  revokeSupportAccess(
    id: string,
    actorUserId: string,
  ): Promise<SupportAccess | null>;
  searchSupportAccess(
    query: SearchSupportAccessQuery,
  ): Promise<SupportAccessListItem[]>;
  countSupportAccess(query: SearchSupportAccessQuery): Promise<number>;
  listActiveSupportAccess(userId: string): Promise<ActiveSupportAccess[]>;
  searchSupportUsers(
    query: SearchSupportUsersQuery,
  ): Promise<SupportUserListItem[]>;
  countSupportUsers(query: SearchSupportUsersQuery): Promise<number>;
  searchAuditLogs(query: SearchAuditLogsQuery): Promise<AuditLogListItem[]>;
  countAuditLogs(query: SearchAuditLogsQuery): Promise<number>;
}

export const PLATFORM_REPOSITORY = 'PLATFORM_REPOSITORY';

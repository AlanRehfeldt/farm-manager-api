import {
  Farm,
  Organization,
  OrganizationStatus,
  PlatformRole,
  Role,
} from '@prisma/client';
import { AdoptionAccess, AdoptionUsage } from '../domain/adoption-window';

export type ProvisionOrganizationData = {
  organizationName: string;
  farmName: string;
  timezone?: string;
  admin: {
    name: string;
    email: string;
    passwordHash: string;
  };
};

export type ProvisionedAdmin = {
  id: string;
  name: string;
  email: string;
  platformRole: PlatformRole;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProvisionOrganizationResult = {
  organization: Organization;
  farm: Farm;
  admin: ProvisionedAdmin;
};

export type PlatformOrganizationListItem = {
  id: string;
  name: string;
  status: OrganizationStatus;
  city: string | null;
  state: string | null;
  createdAt: Date;
  updatedAt: Date;
  farmCount: number;
  lastAccessAt: Date | null;
  lastActivityAt: Date | null;
};

export type SearchPlatformOrganizationsQuery = {
  name?: string;
  status?: OrganizationStatus;
  usage?: AdoptionUsage;
  access?: AdoptionAccess;
  page: number;
  perPage: number;
  orderBy: 'name' | 'createdAt' | 'lastAccessAt' | 'lastActivityAt';
  orderDirection: 'asc' | 'desc';
  now?: Date;
};

export type PlatformOrganizationUsage = {
  activities: number;
  purchases: number;
  salaries: number;
  genericExpenses: number;
  harvests: number;
  activeSeasons: number;
  seasonCount: number;
};

export type PlatformOrganizationDetail = PlatformOrganizationListItem & {
  cnpj: string | null;
  phone: string | null;
  email: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  zipCode: string | null;
  usage: PlatformOrganizationUsage;
};

export type UpdatePlatformOrganizationProfile = {
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
};

export type AdoptionWeekCount = {
  weekStart: string;
  count: number;
};

export type AdoptionSummary = {
  organizations: {
    active: number;
    suspended: number;
  };
  usage: {
    active7d: number;
    active30d: number;
    silent30d: number;
  };
  access: {
    stale30d: number;
  };
  activitiesByWeek: AdoptionWeekCount[];
};

export type PlatformUserMembership = {
  id: string;
  organizationId: string;
  role: Role;
  farmId: string | null;
};

export type PlatformUserListItem = {
  id: string;
  name: string;
  email: string;
  platformRole: PlatformRole;
  mustChangePassword: boolean;
  employeeId: string | null;
  createdAt: Date;
  updatedAt: Date;
  memberships: PlatformUserMembership[];
};

export type SearchPlatformOrganizationFarmsQuery = {
  organizationId: string;
  name?: string;
  page: number;
  perPage: number;
  orderBy: 'name' | 'createdAt';
  orderDirection: 'asc' | 'desc';
};

export type SearchPlatformUsersQuery = {
  organizationId?: string;
  name?: string;
  email?: string;
  page: number;
  perPage: number;
  orderBy: 'name' | 'email' | 'createdAt';
  orderDirection: 'asc' | 'desc';
};

export type SupportAccessListItem = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  organizationId: string;
  organizationName: string;
  grantedByUserId: string;
  grantedByName: string;
  createdAt: Date;
};

export type ActiveSupportAccess = {
  organizationId: string;
  organizationName: string;
};

export type SupportUserListItem = {
  id: string;
  name: string;
  email: string;
  mustChangePassword: boolean;
  createdAt: Date;
};

export type SearchSupportAccessQuery = {
  organizationId?: string;
  userId?: string;
  page: number;
  perPage: number;
  orderBy: 'createdAt';
  orderDirection: 'asc' | 'desc';
};

export type SearchSupportUsersQuery = {
  name?: string;
  email?: string;
  page: number;
  perPage: number;
  orderBy: 'name' | 'createdAt';
  orderDirection: 'asc' | 'desc';
};

export type AuditLogListItem = {
  id: string;
  actorUserId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string | null;
  organizationId: string | null;
  organizationName: string | null;
  createdAt: Date;
};

export type SearchAuditLogsQuery = {
  organizationId?: string;
  actorUserId?: string;
  action?: string;
  page: number;
  perPage: number;
  orderBy: 'createdAt';
  orderDirection: 'asc' | 'desc';
};

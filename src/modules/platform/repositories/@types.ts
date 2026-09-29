import {
  Farm,
  Organization,
  OrganizationStatus,
  PlatformRole,
  Role,
} from '@prisma/client';

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
  createdAt: Date;
  updatedAt: Date;
  farmCount: number;
  seasonCount: number;
  entryCount: number;
  lastAccessAt: Date | null;
};

export type SearchPlatformOrganizationsQuery = {
  name?: string;
  page: number;
  perPage: number;
  orderBy: 'name' | 'createdAt';
  orderDirection: 'asc' | 'desc';
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

import { Membership, Role } from '@prisma/client';

export type CreateMembershipData = {
  userId: string;
  organizationId: string;
  farmId?: string | null;
  role: Role;
};

export type CreateUserWithMembershipsData = {
  name: string;
  email: string;
  password: string;
  role: Role;
  mustChangePassword: boolean;
};

export type ReplaceProfileAndMembershipsData = {
  userId: string;
  name: string;
  email: string;
  organizationId: string;
  memberships: CreateMembershipData[];
};

export type CreateUserWithMembershipsResult = {
  userId: string;
  memberships: Membership[];
};

export interface SearchManyQuery {
  organizationId: string;
  farmId?: string;
  userId?: string;
  role?: Role;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}

export type MembershipRecord = Membership;

export type MembershipUserSummary = {
  id: string;
  name: string;
  email: string;
};

export type MembershipWithUser = Membership & {
  user: MembershipUserSummary;
};

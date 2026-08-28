import { Membership, Role } from '@prisma/client';

export type CreateMembershipData = {
  userId: string;
  organizationId: string;
  farmId?: string | null;
  role: Role;
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

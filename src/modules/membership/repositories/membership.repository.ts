import { Membership } from '@prisma/client';
import {
  CreateMembershipData,
  CreateUserWithMembershipsData,
  CreateUserWithMembershipsResult,
  MembershipWithUser,
  ReplaceProfileAndMembershipsData,
  SearchManyQuery,
} from './@types';

export interface MembershipRepository {
  create(data: CreateMembershipData): Promise<Membership>;
  createMany(data: CreateMembershipData[]): Promise<Membership[]>;
  createUserWithMemberships(
    user: CreateUserWithMembershipsData,
    memberships: Omit<CreateMembershipData, 'userId'>[],
  ): Promise<CreateUserWithMembershipsResult>;
  deleteManyByUserAndOrg(userId: string, organizationId: string): Promise<void>;
  replaceProfileAndMemberships(
    data: ReplaceProfileAndMembershipsData,
  ): Promise<Membership[]>;
  findOrgAdmin(
    userId: string,
    organizationId: string,
  ): Promise<Membership | null>;
  findByUserAndOrgAndFarm(
    userId: string,
    organizationId: string,
    farmId: string | null,
  ): Promise<Membership | null>;
  findManyByUser(userId: string): Promise<Membership[]>;
  findManyByUserAndOrg(
    userId: string,
    organizationId: string,
  ): Promise<Membership[]>;
  searchMany(query: SearchManyQuery): Promise<MembershipWithUser[]>;
  count(query: SearchManyQuery): Promise<number>;
  countOrgAdmins(organizationId: string): Promise<number>;
}

export const MEMBERSHIP_REPOSITORY = 'MEMBERSHIP_REPOSITORY';

import { Membership } from '@prisma/client';
import {
  CreateMembershipData,
  MembershipWithUser,
  SearchManyQuery,
} from './@types';

export interface MembershipRepository {
  create(data: CreateMembershipData): Promise<Membership>;
  createMany(data: CreateMembershipData[]): Promise<Membership[]>;
  delete(id: string): Promise<void>;
  deleteManyByUserAndOrg(userId: string, organizationId: string): Promise<void>;
  replaceForUserOrg(
    userId: string,
    organizationId: string,
    data: CreateMembershipData[],
  ): Promise<Membership[]>;
  findById(id: string): Promise<Membership | null>;
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

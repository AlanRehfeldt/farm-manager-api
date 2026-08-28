import { Membership } from '@prisma/client';
import { CreateMembershipData, SearchManyQuery } from './@types';

export interface MembershipRepository {
  create(data: CreateMembershipData): Promise<Membership>;
  delete(id: string): Promise<void>;
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
  searchMany(query: SearchManyQuery): Promise<Membership[]>;
  count(query: SearchManyQuery): Promise<number>;
  countOrgAdmins(organizationId: string): Promise<number>;
}

export const MEMBERSHIP_REPOSITORY = 'MEMBERSHIP_REPOSITORY';

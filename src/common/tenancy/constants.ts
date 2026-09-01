import { Role } from '@prisma/client';

export const FARM_ID_HEADER = 'x-farm-id';

export type FarmRequestContext = {
  farmId: string;
  organizationId: string;
  membershipRole: Role;
};

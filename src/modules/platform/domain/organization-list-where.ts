import { OrganizationStatus, Prisma } from '@prisma/client';
import {
  AdoptionAccess,
  AdoptionUsage,
  adoptionWindowStart,
} from './adoption-window';

export function organizationListWhere(input: {
  name?: string;
  status?: OrganizationStatus;
  usage?: AdoptionUsage;
  access?: AdoptionAccess;
  now: Date;
}): Prisma.OrganizationWhereInput {
  const filters: Prisma.OrganizationWhereInput[] = [];

  if (input.name) {
    filters.push({
      name: { contains: input.name, mode: 'insensitive' },
    });
  }

  if (input.status) {
    filters.push({ status: input.status });
  }

  if (input.usage === 'active7d') {
    filters.push({
      lastActivityAt: { gte: adoptionWindowStart(input.now, 7) },
    });
  } else if (input.usage === 'active30d') {
    filters.push({
      lastActivityAt: { gte: adoptionWindowStart(input.now, 30) },
    });
  } else if (input.usage === 'silent30d') {
    const since = adoptionWindowStart(input.now, 30);
    filters.push({
      OR: [{ lastActivityAt: null }, { lastActivityAt: { lt: since } }],
    });
  }

  if (input.access === 'stale30d') {
    const since = adoptionWindowStart(input.now, 30);
    filters.push({
      OR: [{ lastAccessAt: null }, { lastAccessAt: { lt: since } }],
    });
  }

  if (filters.length === 0) {
    return {};
  }

  if (filters.length === 1) {
    return filters[0] ?? {};
  }

  return { AND: filters };
}

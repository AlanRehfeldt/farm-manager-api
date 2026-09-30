import { Prisma } from '@prisma/client';
import { COST_CATEGORY_SEED } from '../constants/cost-category-seed';

export async function seedCostCategories(
  tx: Prisma.TransactionClient,
  organizationId: string,
): Promise<void> {
  for (const entry of COST_CATEGORY_SEED) {
    await tx.costCategory.upsert({
      where: {
        organizationId_code: {
          organizationId,
          code: entry.code,
        },
      },
      create: {
        organizationId,
        code: entry.code,
        name: entry.name,
      },
      update: {
        name: entry.name,
      },
    });
  }
}

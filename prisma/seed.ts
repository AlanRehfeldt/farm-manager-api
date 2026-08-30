import { PlatformRole, PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';
import { COST_CATEGORY_SEED } from '../src/modules/cost-category/constants/cost-category-seed';

const prisma = new PrismaClient();

async function seedCostCategoriesForOrganization(organizationId: string) {
  for (const entry of COST_CATEGORY_SEED) {
    await prisma.costCategory.upsert({
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

async function main() {
  const email = process.env.PLATFORM_ADMIN_EMAIL;
  const password = process.env.PLATFORM_ADMIN_PASSWORD;
  const name = process.env.PLATFORM_ADMIN_NAME ?? 'Platform Admin';

  if (!email) {
    throw new Error('PLATFORM_ADMIN_EMAIL is required');
  }

  if (!password) {
    throw new Error('PLATFORM_ADMIN_PASSWORD is required');
  }

  const encryptedPassword = await hash(password, 6);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      name,
      email,
      password: encryptedPassword,
      role: Role.USER,
      platformRole: PlatformRole.PLATFORM_ADMIN,
    },
    update: {
      name,
      password: encryptedPassword,
      platformRole: PlatformRole.PLATFORM_ADMIN,
    },
  });

  console.log(`Platform admin upserted: ${user.email} (${user.id})`);

  const organizations = await prisma.organization.findMany({
    select: { id: true, name: true },
  });

  for (const organization of organizations) {
    await seedCostCategoriesForOrganization(organization.id);
    console.log(
      `Cost categories seeded for organization: ${organization.name}`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });

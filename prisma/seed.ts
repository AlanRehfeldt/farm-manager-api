import { PlatformRole, PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../src/common/crypto/bcrypt';
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

async function seedAllCostCategories() {
  const organizations = await prisma.organization.findMany({
    select: { id: true, name: true },
  });

  if (organizations.length === 0) {
    console.log('No organizations found — skipping cost category seed.');
    return;
  }

  for (const organization of organizations) {
    await seedCostCategoriesForOrganization(organization.id);
    console.log(
      `Cost categories seeded for organization: ${organization.name}`,
    );
  }
}

async function seedPlatformAdminIfConfigured() {
  const email = process.env.PLATFORM_ADMIN_EMAIL;
  const password = process.env.PLATFORM_ADMIN_PASSWORD;
  const name = process.env.PLATFORM_ADMIN_NAME ?? 'Platform Admin';

  if (!email && !password) {
    console.log(
      'PLATFORM_ADMIN_EMAIL/PASSWORD not set — skipping platform admin seed.',
    );
    return;
  }

  if (!email || !password) {
    throw new Error(
      'Set both PLATFORM_ADMIN_EMAIL and PLATFORM_ADMIN_PASSWORD to seed platform admin.',
    );
  }

  const encryptedPassword = await hashPassword(password);

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
}

async function main() {
  await seedAllCostCategories();
  await seedPlatformAdminIfConfigured();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });

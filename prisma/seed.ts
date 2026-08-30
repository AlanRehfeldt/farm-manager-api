import { PlatformRole, PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

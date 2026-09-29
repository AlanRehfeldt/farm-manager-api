import { PlatformRole, PrismaClient } from '@prisma/client';
import { hashPassword } from 'src/common/crypto/bcrypt';

export type InsertUserInput = {
  name: string;
  email: string;
  password: string;
  platformRole?: PlatformRole;
};

export async function insertUser(prisma: PrismaClient, input: InsertUserInput) {
  const encryptedPassword = await hashPassword(input.password);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: encryptedPassword,
      platformRole: input.platformRole ?? PlatformRole.NONE,
    },
  });
}

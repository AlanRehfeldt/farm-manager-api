import { PlatformRole, PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';

export type InsertUserInput = {
  name: string;
  email: string;
  password: string;
  role?: Role;
  platformRole?: PlatformRole;
};

export async function insertUser(prisma: PrismaClient, input: InsertUserInput) {
  const encryptedPassword = await hash(input.password, 6);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: encryptedPassword,
      role: input.role ?? Role.USER,
      platformRole: input.platformRole ?? PlatformRole.NONE,
    },
  });
}

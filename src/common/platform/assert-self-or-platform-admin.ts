import { ForbiddenException } from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';

export async function assertSelfOrPlatformAdmin(
  prisma: PrismaService,
  actorUserId: string,
  targetUserId: string,
): Promise<void> {
  if (actorUserId === targetUserId) {
    return;
  }

  const actor = await prisma.user.findUnique({
    where: { id: actorUserId },
    select: { platformRole: true },
  });

  if (actor?.platformRole === PlatformRole.PLATFORM_ADMIN) {
    return;
  }

  throw new ForbiddenException('Access to this user is forbidden');
}

import { Prisma } from '@prisma/client';

export const PlatformAuditAction = {
  ORGANIZATION_CREATED: 'ORGANIZATION_CREATED',
  ORGANIZATION_STATUS_UPDATED: 'ORGANIZATION_STATUS_UPDATED',
  USER_CREATED: 'USER_CREATED',
  USER_PASSWORD_RESET: 'USER_PASSWORD_RESET',
  SUPPORT_USER_CREATED: 'SUPPORT_USER_CREATED',
  SUPPORT_ACCESS_GRANTED: 'SUPPORT_ACCESS_GRANTED',
  SUPPORT_ACCESS_REVOKED: 'SUPPORT_ACCESS_REVOKED',
  TENANT_WRITE: 'TENANT_WRITE',
} as const;

export type PlatformAuditActionName =
  (typeof PlatformAuditAction)[keyof typeof PlatformAuditAction];

export type PlatformAuditEntry = {
  actorUserId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  organizationId?: string | null;
  metadata?: Prisma.InputJsonValue;
};

export async function appendPlatformAuditLog(
  tx: Prisma.TransactionClient,
  entry: PlatformAuditEntry,
): Promise<void> {
  await tx.platformAuditLog.create({
    data: {
      actorUserId: entry.actorUserId,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId ?? null,
      organizationId: entry.organizationId ?? null,
      metadata: entry.metadata,
    },
  });
}

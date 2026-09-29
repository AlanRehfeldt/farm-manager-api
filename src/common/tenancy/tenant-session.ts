import { OrganizationStatus, PlatformRole } from '@prisma/client';

export type MembershipOrganizationStatus = {
  organization: {
    status: OrganizationStatus;
  };
};

/**
 * Sessão de tenant bloqueada quando o usuário não é platform admin,
 * tem ao menos uma membership e nenhuma org está ACTIVE.
 * Usuário sem membership e PLATFORM_ADMIN seguem autenticando.
 */
export function isTenantSessionSuspended(user: {
  platformRole: PlatformRole;
  memberships: MembershipOrganizationStatus[];
}): boolean {
  if (user.platformRole === PlatformRole.PLATFORM_ADMIN) {
    return false;
  }

  if (user.memberships.length === 0) {
    return false;
  }

  return user.memberships.every(
    (membership) =>
      membership.organization.status === OrganizationStatus.SUSPENDED,
  );
}

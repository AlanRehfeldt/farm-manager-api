import {
  OrganizationSelection,
  OrganizationStatus,
  PlatformRole,
} from '@prisma/client';

export type OrganizationSessionScope = {
  organizationSelection: OrganizationSelection;
  organizationId: string | null;
};

export type SessionMembership = {
  organizationId: string;
  organization: {
    status: OrganizationStatus;
  };
};

export function resolveLoginOrganizationScope(user: {
  platformRole: PlatformRole;
  memberships: SessionMembership[];
}): OrganizationSessionScope {
  if (user.platformRole !== PlatformRole.NONE) {
    return {
      organizationSelection: OrganizationSelection.EXEMPT,
      organizationId: null,
    };
  }

  const activeOrganizationIds = [
    ...new Set(
      user.memberships
        .filter(
          (membership) =>
            membership.organization.status === OrganizationStatus.ACTIVE,
        )
        .map((membership) => membership.organizationId),
    ),
  ];

  if (activeOrganizationIds.length === 0) {
    return {
      organizationSelection: OrganizationSelection.EXEMPT,
      organizationId: null,
    };
  }

  if (activeOrganizationIds.length === 1) {
    return {
      organizationSelection: OrganizationSelection.BOUND,
      organizationId: activeOrganizationIds[0] ?? null,
    };
  }

  return {
    organizationSelection: OrganizationSelection.PENDING,
    organizationId: null,
  };
}

export function boundOrganizationStillActive(
  scope: OrganizationSessionScope,
  memberships: SessionMembership[],
): boolean {
  if (scope.organizationSelection !== OrganizationSelection.BOUND) {
    return true;
  }

  return memberships.some(
    (membership) =>
      membership.organizationId === scope.organizationId &&
      membership.organization.status === OrganizationStatus.ACTIVE,
  );
}

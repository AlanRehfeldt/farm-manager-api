import { ForbiddenException } from '@nestjs/common';
import { OrganizationSelection } from '@prisma/client';

export const FORBIDDEN_ORGANIZATION_CODE = 'FORBIDDEN_ORGANIZATION';

export type SessionOrganization = {
  organizationSelection: OrganizationSelection;
  organizationId: string | null;
};

export function forbiddenOrganization(): ForbiddenException {
  return new ForbiddenException({
    message: 'Access to this organization is forbidden',
    code: FORBIDDEN_ORGANIZATION_CODE,
  });
}

export function assertSessionOrganization(
  user: SessionOrganization,
  requestedOrganizationId: string,
): void {
  if (user.organizationSelection !== OrganizationSelection.BOUND) {
    return;
  }

  if (user.organizationId !== requestedOrganizationId) {
    throw forbiddenOrganization();
  }
}

export function scopedOrganizationId(
  user: SessionOrganization,
  requestedOrganizationId?: string,
): string | undefined {
  if (user.organizationSelection !== OrganizationSelection.BOUND) {
    return requestedOrganizationId;
  }

  if (!user.organizationId) {
    throw forbiddenOrganization();
  }

  if (
    requestedOrganizationId &&
    requestedOrganizationId !== user.organizationId
  ) {
    throw forbiddenOrganization();
  }

  return user.organizationId;
}

export function boundSessionOrganizationId(
  user: SessionOrganization,
): string | null {
  if (user.organizationSelection !== OrganizationSelection.BOUND) {
    return null;
  }

  return user.organizationId;
}

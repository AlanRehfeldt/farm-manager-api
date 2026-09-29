import { SetMetadata } from '@nestjs/common';

export const ALLOW_PENDING_ORGANIZATION_SELECTION_KEY =
  'allowPendingOrganizationSelection';

export const AllowPendingOrganizationSelection = () =>
  SetMetadata(ALLOW_PENDING_ORGANIZATION_SELECTION_KEY, true);

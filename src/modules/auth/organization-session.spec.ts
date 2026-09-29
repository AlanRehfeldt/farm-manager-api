import {
  OrganizationSelection,
  OrganizationStatus,
  PlatformRole,
} from '@prisma/client';
import { resolveLoginOrganizationScope } from './organization-session';

describe('resolveLoginOrganizationScope', () => {
  it('keeps platform roles exempt', () => {
    expect(
      resolveLoginOrganizationScope({
        platformRole: PlatformRole.PLATFORM_SUPPORT,
        memberships: [],
      }),
    ).toEqual({
      organizationSelection: OrganizationSelection.EXEMPT,
      organizationId: null,
    });
  });

  it('stays exempt when the tenant has no active organization', () => {
    expect(
      resolveLoginOrganizationScope({
        platformRole: PlatformRole.NONE,
        memberships: [
          {
            organizationId: 'org-suspended',
            organization: { status: OrganizationStatus.SUSPENDED },
          },
        ],
      }),
    ).toEqual({
      organizationSelection: OrganizationSelection.EXEMPT,
      organizationId: null,
    });
  });

  it('binds the only active organization', () => {
    expect(
      resolveLoginOrganizationScope({
        platformRole: PlatformRole.NONE,
        memberships: [
          {
            organizationId: 'org-1',
            organization: { status: OrganizationStatus.ACTIVE },
          },
          {
            organizationId: 'org-1',
            organization: { status: OrganizationStatus.ACTIVE },
          },
          {
            organizationId: 'org-suspended',
            organization: { status: OrganizationStatus.SUSPENDED },
          },
        ],
      }),
    ).toEqual({
      organizationSelection: OrganizationSelection.BOUND,
      organizationId: 'org-1',
    });
  });

  it('stays pending when more than one organization is active', () => {
    expect(
      resolveLoginOrganizationScope({
        platformRole: PlatformRole.NONE,
        memberships: [
          {
            organizationId: 'org-1',
            organization: { status: OrganizationStatus.ACTIVE },
          },
          {
            organizationId: 'org-2',
            organization: { status: OrganizationStatus.ACTIVE },
          },
        ],
      }),
    ).toEqual({
      organizationSelection: OrganizationSelection.PENDING,
      organizationId: null,
    });
  });
});

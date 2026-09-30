import {
  OrganizationSelection,
  OrganizationStatus,
  PlatformRole,
} from '@prisma/client';
import {
  exemptTenantSessionStillValid,
  resolveLoginOrganizationScope,
} from './organization-session';

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

const activeMembership = {
  organizationId: 'org-1',
  organization: { status: OrganizationStatus.ACTIVE },
};

describe('exemptTenantSessionStillValid', () => {
  it('rejects an exempt tenant session once a membership exists', () => {
    expect(
      exemptTenantSessionStillValid(
        {
          organizationSelection: OrganizationSelection.EXEMPT,
          organizationId: null,
        },
        {
          platformRole: PlatformRole.NONE,
          memberships: [activeMembership],
        },
      ),
    ).toBe(false);
  });

  it('keeps an exempt tenant session while there is no membership', () => {
    expect(
      exemptTenantSessionStillValid(
        {
          organizationSelection: OrganizationSelection.EXEMPT,
          organizationId: null,
        },
        {
          platformRole: PlatformRole.NONE,
          memberships: [],
        },
      ),
    ).toBe(true);
  });

  it.each([PlatformRole.PLATFORM_ADMIN, PlatformRole.PLATFORM_SUPPORT])(
    'keeps %s exempt even with a membership',
    (platformRole) => {
      expect(
        exemptTenantSessionStillValid(
          {
            organizationSelection: OrganizationSelection.EXEMPT,
            organizationId: null,
          },
          {
            platformRole,
            memberships: [activeMembership],
          },
        ),
      ).toBe(true);
    },
  );

  it.each([OrganizationSelection.BOUND, OrganizationSelection.PENDING])(
    'ignores a %s session',
    (organizationSelection) => {
      expect(
        exemptTenantSessionStillValid(
          {
            organizationSelection,
            organizationId:
              organizationSelection === OrganizationSelection.BOUND
                ? 'org-1'
                : null,
          },
          {
            platformRole: PlatformRole.NONE,
            memberships: [activeMembership],
          },
        ),
      ).toBe(true);
    },
  );
});

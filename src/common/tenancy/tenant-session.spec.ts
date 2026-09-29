import { OrganizationStatus, PlatformRole } from '@prisma/client';
import { isTenantSessionSuspended } from './tenant-session';

describe('isTenantSessionSuspended', () => {
  it('allows a platform admin', () => {
    expect(
      isTenantSessionSuspended({
        platformRole: PlatformRole.PLATFORM_ADMIN,
        memberships: [
          { organization: { status: OrganizationStatus.SUSPENDED } },
        ],
      }),
    ).toBe(false);
  });

  it('allows a user with no memberships', () => {
    expect(
      isTenantSessionSuspended({
        platformRole: PlatformRole.NONE,
        memberships: [],
      }),
    ).toBe(false);
  });

  it('blocks a user whose organizations are all suspended', () => {
    expect(
      isTenantSessionSuspended({
        platformRole: PlatformRole.NONE,
        memberships: [
          { organization: { status: OrganizationStatus.SUSPENDED } },
          { organization: { status: OrganizationStatus.SUSPENDED } },
        ],
      }),
    ).toBe(true);
  });

  it('allows a user who still has an active organization', () => {
    expect(
      isTenantSessionSuspended({
        platformRole: PlatformRole.NONE,
        memberships: [
          { organization: { status: OrganizationStatus.SUSPENDED } },
          { organization: { status: OrganizationStatus.ACTIVE } },
        ],
      }),
    ).toBe(false);
  });
});

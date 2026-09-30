import { OrganizationStatus } from '@prisma/client';
import { organizationListWhere } from './organization-list-where';

describe('organizationListWhere', () => {
  const now = new Date('2026-09-30T15:00:00.000Z');

  it('filters silent organizations by the stored activity timestamp', () => {
    expect(
      organizationListWhere({
        usage: 'silent30d',
        status: OrganizationStatus.ACTIVE,
        now,
      }),
    ).toEqual({
      AND: [
        { status: OrganizationStatus.ACTIVE },
        {
          OR: [
            { lastActivityAt: null },
            { lastActivityAt: { lt: new Date('2026-08-31T15:00:00.000Z') } },
          ],
        },
      ],
    });
  });

  it('keeps usage and access as separate conditions', () => {
    const where = organizationListWhere({
      usage: 'active7d',
      access: 'stale30d',
      now,
    });

    expect(where).toEqual({
      AND: [
        { lastActivityAt: { gte: new Date('2026-09-23T15:00:00.000Z') } },
        {
          OR: [
            { lastAccessAt: null },
            { lastAccessAt: { lt: new Date('2026-08-31T15:00:00.000Z') } },
          ],
        },
      ],
    });
  });
});

import { CostEntrySourceType } from '@prisma/client';
import { isActivityFullyReversed } from './is-activity-fully-reversed';

describe('isActivityFullyReversed', () => {
  it('returns false when there are no cost entries (open CLT hours only)', () => {
    expect(isActivityFullyReversed([])).toBe(false);
  });

  it('returns false when any original entry is still open', () => {
    expect(
      isActivityFullyReversed([
        {
          sourceType: CostEntrySourceType.ACTIVITY_LABOR,
          reversedAt: new Date(),
        },
        {
          sourceType: CostEntrySourceType.ACTIVITY_INPUT,
          reversedAt: null,
        },
      ]),
    ).toBe(false);
  });

  it('returns true when every original entry is reversed', () => {
    expect(
      isActivityFullyReversed([
        {
          sourceType: CostEntrySourceType.ACTIVITY_LABOR,
          reversedAt: new Date(),
        },
        {
          sourceType: CostEntrySourceType.REVERSAL,
          reversedAt: null,
        },
      ]),
    ).toBe(true);
  });
});

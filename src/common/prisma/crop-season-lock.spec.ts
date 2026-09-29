import { sortCropSeasonLockKeys } from './crop-season-lock';

describe('sortCropSeasonLockKeys', () => {
  it('deduplicates and sorts by crop season then farm', () => {
    const first = sortCropSeasonLockKeys([
      { farmId: 'farm-b', cropSeasonId: 'season-2' },
      { farmId: 'farm-a', cropSeasonId: 'season-2' },
      { farmId: 'farm-b', cropSeasonId: 'season-1' },
      { farmId: 'farm-b', cropSeasonId: 'season-2' },
    ]);
    const reversed = sortCropSeasonLockKeys([
      { farmId: 'farm-b', cropSeasonId: 'season-2' },
      { farmId: 'farm-b', cropSeasonId: 'season-1' },
      { farmId: 'farm-a', cropSeasonId: 'season-2' },
    ]);

    expect(first).toEqual([
      { farmId: 'farm-b', cropSeasonId: 'season-1' },
      { farmId: 'farm-a', cropSeasonId: 'season-2' },
      { farmId: 'farm-b', cropSeasonId: 'season-2' },
    ]);
    expect(reversed).toEqual(first);
  });
});

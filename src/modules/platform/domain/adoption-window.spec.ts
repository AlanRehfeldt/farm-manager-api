import {
  ADOPTION_TIME_ZONE,
  adoptionWeekSeries,
  adoptionWindowStart,
  isWithinAdoptionWindow,
} from './adoption-window';

describe('adoption window', () => {
  const now = new Date('2026-09-30T15:00:00.000Z');

  it('uses a rolling window instead of a calendar month', () => {
    expect(adoptionWindowStart(now, 30).toISOString()).toBe(
      '2026-08-31T15:00:00.000Z',
    );
    expect(adoptionWindowStart(now, 7).toISOString()).toBe(
      '2026-09-23T15:00:00.000Z',
    );
  });

  it('treats a missing timestamp as outside the window', () => {
    expect(isWithinAdoptionWindow(null, now, 30)).toBe(false);
    expect(
      isWithinAdoptionWindow(new Date('2026-09-01T00:00:00.000Z'), now, 30),
    ).toBe(true);
    expect(
      isWithinAdoptionWindow(new Date('2026-08-01T00:00:00.000Z'), now, 30),
    ).toBe(false);
  });

  it('builds twelve Monday weeks in America/Sao_Paulo', () => {
    const series = adoptionWeekSeries(now);

    expect(series).toHaveLength(12);
    expect(series[11]?.weekStart).toBe('2026-09-28');
    expect(series[0]?.weekStart).toBe('2026-07-13');
    expect(series[0]?.since.toISOString()).toBe('2026-07-13T03:00:00.000Z');

    const weekday = new Intl.DateTimeFormat('en-US', {
      timeZone: ADOPTION_TIME_ZONE,
      weekday: 'short',
    }).format(series[11].since);
    expect(weekday).toBe('Mon');
  });
});

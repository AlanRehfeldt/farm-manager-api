export const ADOPTION_TIME_ZONE = 'America/Sao_Paulo';

export const ADOPTION_RECENT_DAYS = 7;
export const ADOPTION_ACTIVE_DAYS = 30;
export const ADOPTION_SERIES_WEEKS = 12;

/** Refresh grava último acesso no máximo uma vez por hora. */
export const LAST_ACCESS_REFRESH_MIN_AGE_MS = 60 * 60 * 1000;

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export type AdoptionUsage = 'active7d' | 'active30d' | 'silent30d';

export type AdoptionAccess = 'stale30d';

export function adoptionWindowStart(now: Date, days: number): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export function isWithinAdoptionWindow(
  at: Date | null,
  now: Date,
  days: number,
): boolean {
  if (!at) {
    return false;
  }

  return at.getTime() >= adoptionWindowStart(now, days).getTime();
}

type ZonedDateParts = {
  year: number;
  month: number;
  day: number;
  weekday: number;
};

function zonedDateParts(date: Date, timeZone: string): ZonedDateParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  const weekday = WEEKDAY_INDEX[parts.weekday ?? ''];

  if (weekday === undefined) {
    throw new Error(`Unknown weekday in ${timeZone}`);
  }

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    weekday,
  };
}

function timeZoneOffsetMs(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  return asUtc - date.getTime();
}

/** Meia-noite civil em America/Sao_Paulo, como instante UTC. */
export function saoPauloMidnightUtc(
  year: number,
  month: number,
  day: number,
): Date {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const offset = timeZoneOffsetMs(utcGuess, ADOPTION_TIME_ZONE);

  return new Date(utcGuess.getTime() - offset);
}

export function formatIsoDate(
  year: number,
  month: number,
  day: number,
): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export type AdoptionWeek = {
  weekStart: string;
  since: Date;
};

/** Semanas ISO (segunda) em America/Sao_Paulo, da mais antiga para a atual. */
export function adoptionWeekSeries(
  now: Date,
  weeks = ADOPTION_SERIES_WEEKS,
): AdoptionWeek[] {
  const today = zonedDateParts(now, ADOPTION_TIME_ZONE);
  const daysSinceMonday = today.weekday === 0 ? 6 : today.weekday - 1;
  const currentMondayUtc = saoPauloMidnightUtc(
    today.year,
    today.month,
    today.day,
  );
  currentMondayUtc.setUTCDate(currentMondayUtc.getUTCDate() - daysSinceMonday);

  const series: AdoptionWeek[] = [];

  for (let index = weeks - 1; index >= 0; index -= 1) {
    const since = new Date(currentMondayUtc.getTime());
    since.setUTCDate(since.getUTCDate() - index * 7);
    const parts = zonedDateParts(since, ADOPTION_TIME_ZONE);
    series.push({
      weekStart: formatIsoDate(parts.year, parts.month, parts.day),
      since,
    });
  }

  return series;
}

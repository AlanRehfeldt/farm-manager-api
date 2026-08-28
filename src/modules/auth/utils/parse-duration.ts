const durationPattern = /^(\d+)(ms|s|m|h|d)$/;

const unitToMs: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

export function parseDurationToMs(duration: string): number {
  const match = durationPattern.exec(duration);
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }

  const value = Number(match[1]);
  const unit = match[2];

  return value * unitToMs[unit];
}

export function parseDurationToDate(duration: string, from = new Date()): Date {
  return new Date(from.getTime() + parseDurationToMs(duration));
}

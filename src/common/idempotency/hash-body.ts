import { createHash } from 'node:crypto';

function sortKeys(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }

  const record = value as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};

  for (const key of Object.keys(record).sort()) {
    sorted[key] = sortKeys(record[key]);
  }

  return sorted;
}

export function hashBody(body: unknown): string {
  const normalized = JSON.stringify(sortKeys(body ?? {}));
  return createHash('sha256').update(normalized).digest('hex');
}

import { BadRequestException } from '@nestjs/common';

export function resolveFarmIds(input: {
  farmId?: string | null;
  farmIds?: string[];
}): string[] | null {
  const hasFarmIds = input.farmIds !== undefined;
  const hasFarmId = input.farmId !== undefined;

  if (hasFarmIds && hasFarmId) {
    throw new BadRequestException('Use farmIds or farmId, not both');
  }

  if (hasFarmIds) {
    const unique = [...new Set(input.farmIds)];
    return unique.length === 0 ? null : unique;
  }

  if (input.farmId == null) {
    return null;
  }

  return [input.farmId];
}

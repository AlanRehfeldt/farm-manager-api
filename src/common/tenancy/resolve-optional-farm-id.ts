import { BadRequestException } from '@nestjs/common';

export function resolveOptionalFarmId(
  requestedFarmId: string | null | undefined,
  activeFarmId: string,
): string | null {
  if (requestedFarmId == null) {
    return null;
  }

  if (requestedFarmId !== activeFarmId) {
    throw new BadRequestException('farmId must match the x-farm-id header');
  }

  return requestedFarmId;
}

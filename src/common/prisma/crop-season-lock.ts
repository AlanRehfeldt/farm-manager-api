import { ConflictException, NotFoundException } from '@nestjs/common';
import { CropSeasonStatus, Prisma } from '@prisma/client';

type CropSeasonLockRow = {
  status: CropSeasonStatus;
};

export type CropSeasonLockKey = {
  farmId: string;
  cropSeasonId: string;
};

/** Deduplica e ordena por safra, depois fazenda, para o FOR UPDATE não inverter a ordem. */
export function sortCropSeasonLockKeys(
  keys: CropSeasonLockKey[],
): CropSeasonLockKey[] {
  return [
    ...new Map(
      keys.map((key) => [`${key.farmId}:${key.cropSeasonId}`, key]),
    ).values(),
  ].sort((a, b) =>
    a.cropSeasonId !== b.cropSeasonId
      ? a.cropSeasonId.localeCompare(b.cropSeasonId)
      : a.farmId.localeCompare(b.farmId),
  );
}

export async function lockActiveCropSeasons(
  tx: Prisma.TransactionClient,
  keys: CropSeasonLockKey[],
): Promise<void> {
  for (const lock of sortCropSeasonLockKeys(keys)) {
    await assertActiveCropSeasonLocked(tx, lock.cropSeasonId, lock.farmId);
  }
}

export async function lockCropSeasonRow(
  tx: Prisma.TransactionClient,
  cropSeasonId: string,
  farmId: string,
): Promise<CropSeasonLockRow> {
  const rows = await tx.$queryRaw<CropSeasonLockRow[]>`
    SELECT status
    FROM crop_seasons
    WHERE id = ${cropSeasonId}
      AND "farmId" = ${farmId}
    FOR UPDATE
  `;

  if (rows.length === 0) {
    throw new NotFoundException('Crop season not found');
  }

  return rows[0];
}

export async function assertActiveCropSeasonLocked(
  tx: Prisma.TransactionClient,
  cropSeasonId: string,
  farmId: string,
): Promise<void> {
  const row = await lockCropSeasonRow(tx, cropSeasonId, farmId);

  if (row.status !== CropSeasonStatus.ACTIVE) {
    throw new ConflictException('Operation requires an active crop season');
  }
}

export async function assertActiveCropSeasonForClose(
  tx: Prisma.TransactionClient,
  cropSeasonId: string,
  farmId: string,
): Promise<void> {
  const row = await lockCropSeasonRow(tx, cropSeasonId, farmId);

  if (row.status === CropSeasonStatus.CLOSED) {
    throw new ConflictException('Crop season is already closed');
  }

  if (row.status !== CropSeasonStatus.ACTIVE) {
    throw new ConflictException('Only active crop seasons can be closed');
  }
}

export async function assertClosedCropSeasonForReopen(
  tx: Prisma.TransactionClient,
  cropSeasonId: string,
  farmId: string,
): Promise<void> {
  const row = await lockCropSeasonRow(tx, cropSeasonId, farmId);

  if (row.status === CropSeasonStatus.ACTIVE) {
    throw new ConflictException('Crop season is already active');
  }

  if (row.status !== CropSeasonStatus.CLOSED) {
    throw new ConflictException('Only closed crop seasons can be reopened');
  }
}

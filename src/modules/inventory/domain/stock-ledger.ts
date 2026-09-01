import { ConflictException } from '@nestjs/common';
import {
  DomainConflictCode,
  domainConflict,
} from 'src/common/errors/domain-conflict';
import {
  Prisma,
  StockMovementSourceType,
  StockMovementType,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { computeNewAvgCost } from './avg-cost';
import { applyStockAdjustment } from './stock-adjustment';
import { applyStockOut as computeStockOutQuantity } from './stock-out';

export type LockedStockBalance = {
  quantityOnHand: Decimal;
  avgCost: Decimal;
  version: number;
};

type StockBalanceRow = {
  quantityOnHand: Decimal;
  avgCost: Decimal;
  version: number;
};

async function ensureStockBalanceRow(
  tx: Prisma.TransactionClient,
  farmId: string,
  productId: string,
): Promise<void> {
  await tx.productStockBalance.createMany({
    data: [
      {
        farmId,
        productId,
        quantityOnHand: new Decimal(0),
        avgCost: new Decimal(0),
        version: 0,
      },
    ],
    skipDuplicates: true,
  });
}

export async function lockStockBalance(
  tx: Prisma.TransactionClient,
  farmId: string,
  productId: string,
): Promise<LockedStockBalance> {
  await ensureStockBalanceRow(tx, farmId, productId);

  const rows = await tx.$queryRaw<StockBalanceRow[]>`
    SELECT "quantityOnHand", "avgCost", version
    FROM product_stock_balances
    WHERE "farmId" = ${farmId}
      AND "productId" = ${productId}
    FOR UPDATE
  `;

  if (rows.length === 0) {
    throw new ConflictException('Stock balance row could not be locked');
  }

  const row = rows[0];

  return {
    quantityOnHand: row.quantityOnHand,
    avgCost: row.avgCost,
    version: row.version,
  };
}

async function persistStockBalance(
  tx: Prisma.TransactionClient,
  farmId: string,
  productId: string,
  expectedVersion: number,
  quantityOnHand: Decimal,
  avgCost: Decimal,
): Promise<void> {
  const result = await tx.productStockBalance.updateMany({
    where: {
      farmId,
      productId,
      version: expectedVersion,
    },
    data: {
      quantityOnHand,
      avgCost,
      version: expectedVersion + 1,
    },
  });

  if (result.count === 0) {
    throw new ConflictException(
      'Stock balance was modified concurrently; retry the operation',
    );
  }
}

export type ApplyStockInInput = {
  farmId: string;
  productId: string;
  quantity: Decimal;
  unitPriceInReais: Decimal;
  date: Date;
  transactionId: string;
};

export type ApplyStockInResult = {
  quantityOnHand: Decimal;
  avgCost: Decimal;
  unitCostSnapshot: Decimal;
};

export async function applyStockIn(
  tx: Prisma.TransactionClient,
  input: ApplyStockInInput,
): Promise<ApplyStockInResult> {
  const balance = await lockStockBalance(tx, input.farmId, input.productId);

  await tx.stockMovement.create({
    data: {
      farmId: input.farmId,
      type: StockMovementType.IN,
      productId: input.productId,
      quantity: input.quantity,
      date: input.date,
      transactionId: input.transactionId,
      sourceType: StockMovementSourceType.PURCHASE,
      sourceId: input.transactionId,
    },
  });

  const { quantityOnHand, avgCost } = computeNewAvgCost(
    balance.quantityOnHand,
    balance.avgCost,
    input.quantity,
    input.unitPriceInReais,
  );

  await persistStockBalance(
    tx,
    input.farmId,
    input.productId,
    balance.version,
    quantityOnHand,
    avgCost,
  );

  return { quantityOnHand, avgCost, unitCostSnapshot: avgCost };
}

export type ApplyStockOutInput = {
  farmId: string;
  productId: string;
  quantity: Decimal;
  date: Date;
  sourceId: string;
  productName: string;
};

export type ApplyStockOutResult = {
  quantityOnHand: Decimal;
  unitCostSnapshot: Decimal;
};

export async function applyStockOut(
  tx: Prisma.TransactionClient,
  input: ApplyStockOutInput,
): Promise<ApplyStockOutResult> {
  const balance = await lockStockBalance(tx, input.farmId, input.productId);

  if (input.quantity.gt(balance.quantityOnHand)) {
    throw domainConflict(
      DomainConflictCode.INSUFFICIENT_STOCK,
      `Insufficient stock for ${input.productName}: available ${balance.quantityOnHand.toString()}, requested ${input.quantity.toString()}`,
    );
  }

  await tx.stockMovement.create({
    data: {
      farmId: input.farmId,
      type: StockMovementType.OUT,
      productId: input.productId,
      quantity: input.quantity,
      date: input.date,
      sourceType: StockMovementSourceType.ACTIVITY,
      sourceId: input.sourceId,
    },
  });

  const quantityOnHand = computeStockOutQuantity(
    balance.quantityOnHand,
    input.quantity,
  );
  const unitCostSnapshot = balance.avgCost;

  await persistStockBalance(
    tx,
    input.farmId,
    input.productId,
    balance.version,
    quantityOnHand,
    balance.avgCost,
  );

  return { quantityOnHand, unitCostSnapshot };
}

export type ApplyCompensatoryStockInInput = {
  farmId: string;
  productId: string;
  quantity: Decimal;
  date: Date;
  sourceId: string;
  note?: string | null;
};

export type ApplyCompensatoryStockInResult = {
  quantityOnHand: Decimal;
};

/**
 * IN compensatório de estorno de atividade: devolve quantidade sem alterar o custo médio.
 */
export async function applyCompensatoryStockIn(
  tx: Prisma.TransactionClient,
  input: ApplyCompensatoryStockInInput,
): Promise<ApplyCompensatoryStockInResult> {
  const balance = await lockStockBalance(tx, input.farmId, input.productId);

  await tx.stockMovement.create({
    data: {
      farmId: input.farmId,
      type: StockMovementType.IN,
      productId: input.productId,
      quantity: input.quantity,
      date: input.date,
      note: input.note,
      sourceType: StockMovementSourceType.ACTIVITY,
      sourceId: input.sourceId,
    },
  });

  const quantityOnHand = balance.quantityOnHand.add(input.quantity);

  await persistStockBalance(
    tx,
    input.farmId,
    input.productId,
    balance.version,
    quantityOnHand,
    balance.avgCost,
  );

  return { quantityOnHand };
}

export type ApplyStockAdjustmentInput = {
  movementId: string;
  farmId: string;
  productId: string;
  signedQuantity: Decimal;
  date: Date;
  note: string;
};

export type ApplyStockAdjustmentResult = {
  quantityOnHand: Decimal;
  avgCost: Decimal;
};

export async function applyStockAdjustmentLedger(
  tx: Prisma.TransactionClient,
  input: ApplyStockAdjustmentInput,
): Promise<ApplyStockAdjustmentResult> {
  const balance = await lockStockBalance(tx, input.farmId, input.productId);
  const quantityOnHand = applyStockAdjustment(
    balance.quantityOnHand,
    input.signedQuantity,
  );

  if (quantityOnHand.lt(0)) {
    throw domainConflict(
      DomainConflictCode.INSUFFICIENT_STOCK,
      `Adjustment would result in negative stock: available ${balance.quantityOnHand.toString()}, adjustment ${input.signedQuantity.toString()}`,
    );
  }

  await tx.stockMovement.create({
    data: {
      id: input.movementId,
      farmId: input.farmId,
      type: StockMovementType.ADJUSTMENT,
      productId: input.productId,
      quantity: input.signedQuantity.abs(),
      date: input.date,
      note: input.note,
      sourceType: StockMovementSourceType.ADJUSTMENT,
      sourceId: input.movementId,
    },
  });

  await persistStockBalance(
    tx,
    input.farmId,
    input.productId,
    balance.version,
    quantityOnHand,
    balance.avgCost,
  );

  return { quantityOnHand, avgCost: balance.avgCost };
}

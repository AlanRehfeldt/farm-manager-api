import { CreateStockAdjustmentData, StockAdjustmentResult } from './@types';

export interface StockMovementRepository {
  createAdjustment(
    data: CreateStockAdjustmentData,
  ): Promise<StockAdjustmentResult>;
}

export const STOCK_MOVEMENT_REPOSITORY = 'STOCK_MOVEMENT_REPOSITORY';

import { Decimal } from '@prisma/client/runtime/library';
import { applyStockAdjustment } from './stock-adjustment';

describe('applyStockAdjustment', () => {
  it('decrements balance with negative quantity', () => {
    const result = applyStockAdjustment(new Decimal(100), new Decimal(-5));
    expect(result.toString()).toBe('95');
  });

  it('increments balance with positive quantity', () => {
    const result = applyStockAdjustment(new Decimal(100), new Decimal(10));
    expect(result.toString()).toBe('110');
  });

  it('allows zero on hand with positive adjustment', () => {
    const result = applyStockAdjustment(new Decimal(0), new Decimal(5));
    expect(result.toString()).toBe('5');
  });
});

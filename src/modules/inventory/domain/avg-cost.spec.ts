import { Decimal } from '@prisma/client/runtime/library';
import { computeNewAvgCost } from './avg-cost';

describe('computeNewAvgCost', () => {
  it('sets avgCost to unit price when stock is zero', () => {
    const result = computeNewAvgCost(
      new Decimal(0),
      new Decimal(0),
      new Decimal(100),
      new Decimal(2),
    );

    expect(result.quantityOnHand.toString()).toBe('100');
    expect(result.avgCost.toString()).toBe('2');
  });

  it('computes weighted average for subsequent purchases (US-032)', () => {
    const first = computeNewAvgCost(
      new Decimal(0),
      new Decimal(0),
      new Decimal(100),
      new Decimal(2),
    );

    const second = computeNewAvgCost(
      first.quantityOnHand,
      first.avgCost,
      new Decimal(100),
      new Decimal(4),
    );

    expect(second.quantityOnHand.toString()).toBe('200');
    expect(second.avgCost.toString()).toBe('3');
  });
});

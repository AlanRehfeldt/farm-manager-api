import { Decimal } from '@prisma/client/runtime/library';
import { applyStockOut } from './stock-out';

describe('applyStockOut', () => {
  it('decrements quantity on hand', () => {
    const result = applyStockOut(new Decimal('100'), new Decimal('30'));
    expect(result.toString()).toBe('70');
  });

  it('computes negative result when out exceeds on hand (blocked at repository)', () => {
    const result = applyStockOut(new Decimal('50'), new Decimal('100'));
    expect(result.toString()).toBe('-50');
  });

  it('handles zero on hand', () => {
    const result = applyStockOut(new Decimal('0'), new Decimal('10'));
    expect(result.toString()).toBe('-10');
  });
});

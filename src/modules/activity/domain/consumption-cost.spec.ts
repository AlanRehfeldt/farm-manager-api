import { Decimal } from '@prisma/client/runtime/library';
import { computeConsumptionAmountInCents } from './consumption-cost';

describe('computeConsumptionAmountInCents', () => {
  it('multiplies quantity by unit cost and rounds to cents', () => {
    const amount = computeConsumptionAmountInCents('100', new Decimal('3.50'));
    expect(amount).toBe(35000n);
  });

  it('rounds half-up to nearest cent', () => {
    const amount = computeConsumptionAmountInCents('1', new Decimal('0.005'));
    expect(amount).toBe(1n);
  });

  it('handles fractional quantities', () => {
    const amount = computeConsumptionAmountInCents('10.5', new Decimal('2.00'));
    expect(amount).toBe(2100n);
  });

  it('returns zero when unit cost is zero', () => {
    const amount = computeConsumptionAmountInCents('100', new Decimal('0'));
    expect(amount).toBe(0n);
  });
});

import { computeLineTotalInCents, sumLineTotalsInCents } from './line-total';

describe('line-total', () => {
  describe('computeLineTotalInCents', () => {
    it('multiplies quantity by unit price in cents', () => {
      expect(computeLineTotalInCents('1000', 350)).toBe(350000n);
    });

    it('rounds half-up for fractional cent totals', () => {
      expect(computeLineTotalInCents('1.5', 100)).toBe(150n);
      expect(computeLineTotalInCents('0.333', 100)).toBe(33n);
    });
  });

  describe('sumLineTotalsInCents', () => {
    it('sums multiple line totals', () => {
      const total = sumLineTotalsInCents([
        { quantity: '1000', priceInCents: 350 },
        { quantity: '500', priceInCents: 200 },
      ]);

      expect(total).toBe(450000n);
    });
  });
});

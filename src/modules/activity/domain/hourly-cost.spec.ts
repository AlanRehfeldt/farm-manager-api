import { computeHourlyAmountInCents } from './hourly-cost';

describe('computeHourlyAmountInCents', () => {
  it('multiplies hours by hourly rate in cents', () => {
    expect(computeHourlyAmountInCents('3', 5000n)).toBe(15000n);
  });

  it('rounds half-up to integer cents', () => {
    expect(computeHourlyAmountInCents('1.5', 3333n)).toBe(5000n);
  });

  it('handles fractional hours', () => {
    expect(computeHourlyAmountInCents('0.25', 40000n)).toBe(10000n);
  });
});

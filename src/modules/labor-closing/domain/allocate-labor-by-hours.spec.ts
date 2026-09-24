import { Decimal } from '@prisma/client/runtime/library';
import { allocateLaborByHours } from './allocate-labor-by-hours';

describe('allocateLaborByHours', () => {
  it('dilutes R$ 3.200 across 160 hours with residue on largest line', () => {
    const result = allocateLaborByHours(320000n, [
      { activityLaborId: 'lab-a', hours: new Decimal(100) },
      { activityLaborId: 'lab-b', hours: new Decimal(60) },
    ]);

    const byId = Object.fromEntries(
      result.map((entry) => [entry.activityLaborId, entry.amountInCents]),
    );

    // 320000 / 160 = 2000 per hour → 100h=200000, 60h=120000
    expect(byId['lab-a']).toBe(200000n);
    expect(byId['lab-b']).toBe(120000n);
    expect(result.reduce((sum, entry) => sum + entry.amountInCents, 0n)).toBe(
      320000n,
    );
  });

  it('assigns residue to largest hours; tie → smallest activityLaborId', () => {
    const result = allocateLaborByHours(100n, [
      { activityLaborId: 'lab-c', hours: new Decimal(1) },
      { activityLaborId: 'lab-b', hours: new Decimal(1) },
      { activityLaborId: 'lab-a', hours: new Decimal(1) },
    ]);

    const byId = Object.fromEntries(
      result.map((entry) => [entry.activityLaborId, entry.amountInCents]),
    );

    expect(byId['lab-a']).toBe(34n);
    expect(byId['lab-b']).toBe(33n);
    expect(byId['lab-c']).toBe(33n);
    expect(result.reduce((sum, entry) => sum + entry.amountInCents, 0n)).toBe(
      100n,
    );
  });

  it('preserves totals for uneven hours (half-up + residue)', () => {
    const result = allocateLaborByHours(10000n, [
      { activityLaborId: 'lab-a', hours: new Decimal('1.5') },
      { activityLaborId: 'lab-b', hours: new Decimal('2.5') },
    ]);

    expect(result.reduce((sum, entry) => sum + entry.amountInCents, 0n)).toBe(
      10000n,
    );
    const byId = Object.fromEntries(
      result.map((entry) => [entry.activityLaborId, entry.amountInCents]),
    );
    // 10000 * 1.5/4 = 3750; residue on lab-b (largest hours) = 6250
    expect(byId['lab-a']).toBe(3750n);
    expect(byId['lab-b']).toBe(6250n);
  });
});

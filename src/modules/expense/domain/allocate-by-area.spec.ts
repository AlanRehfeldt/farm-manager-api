import { Decimal } from '@prisma/client/runtime/library';
import { allocateByArea } from './allocate-by-area';

describe('allocateByArea', () => {
  it('distributes 10000 cents across 2 ha and 1 ha with residue on largest', () => {
    const result = allocateByArea(10000n, [
      { fieldId: 'field-a', areaHa: new Decimal(2) },
      { fieldId: 'field-b', areaHa: new Decimal(1) },
    ]);

    const byField = Object.fromEntries(
      result.map((entry) => [entry.fieldId, entry.amountInCents]),
    );

    expect(byField['field-a']).toBe(6667n);
    expect(byField['field-b']).toBe(3333n);
    expect(result.reduce((sum, entry) => sum + entry.amountInCents, 0n)).toBe(
      10000n,
    );
  });

  it('assigns residue to smallest fieldId on area tie', () => {
    const result = allocateByArea(100n, [
      { fieldId: 'field-c', areaHa: new Decimal(1) },
      { fieldId: 'field-b', areaHa: new Decimal(1) },
      { fieldId: 'field-a', areaHa: new Decimal(1) },
    ]);

    const byField = Object.fromEntries(
      result.map((entry) => [entry.fieldId, entry.amountInCents]),
    );

    expect(byField['field-a']).toBe(34n);
    expect(byField['field-b']).toBe(33n);
    expect(byField['field-c']).toBe(33n);
    expect(result.reduce((sum, entry) => sum + entry.amountInCents, 0n)).toBe(
      100n,
    );
  });
});

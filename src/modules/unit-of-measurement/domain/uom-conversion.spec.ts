import { BadRequestException } from '@nestjs/common';
import { UomDimension } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  assertSameDimension,
  convertQuantity,
  UOM_DIMENSION_MISMATCH,
} from './uom-conversion';

const kg = {
  id: 'uom-kg',
  dimension: UomDimension.MASS,
  factorToBase: new Decimal(1),
};

const box = {
  id: 'uom-box',
  dimension: UomDimension.MASS,
  factorToBase: new Decimal(4.5),
};

const liter = {
  id: 'uom-l',
  dimension: UomDimension.VOLUME,
  factorToBase: new Decimal(1),
};

describe('uom-conversion (INV-UOM)', () => {
  it('converts within the same dimension using factorToBase', () => {
    const result = convertQuantity(2, box, kg);

    expect(result.toString()).toBe('9');
  });

  it('returns the same quantity when source and target are identical', () => {
    const result = convertQuantity('10', kg, kg);

    expect(result.toString()).toBe('10');
  });

  it('rejects cross-dimension conversion with UOM_DIMENSION_MISMATCH', () => {
    expect(() => assertSameDimension(kg, liter)).toThrow(BadRequestException);
    expect(() => assertSameDimension(kg, liter)).toThrow(
      UOM_DIMENSION_MISMATCH,
    );
    expect(() => convertQuantity(1, kg, liter)).toThrow(UOM_DIMENSION_MISMATCH);
  });
});

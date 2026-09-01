import { BadRequestException } from '@nestjs/common';
import { UomDimension } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export const UOM_DIMENSION_MISMATCH = 'UOM_DIMENSION_MISMATCH';

export type UomConversionFields = {
  id: string;
  dimension: UomDimension;
  factorToBase: Decimal;
};

export function assertSameDimension(
  from: Pick<UomConversionFields, 'dimension'>,
  to: Pick<UomConversionFields, 'dimension'>,
): void {
  if (from.dimension !== to.dimension) {
    throw new BadRequestException(
      `Cannot convert between ${from.dimension} and ${to.dimension} (${UOM_DIMENSION_MISMATCH})`,
    );
  }
}

export function convertQuantity(
  quantity: Decimal | string | number,
  from: UomConversionFields,
  to: UomConversionFields,
): Decimal {
  assertSameDimension(from, to);

  const qty = quantity instanceof Decimal ? quantity : new Decimal(quantity);
  const fromFactor = new Decimal(from.factorToBase);
  const toFactor = new Decimal(to.factorToBase);

  if (fromFactor.lte(0) || toFactor.lte(0)) {
    throw new BadRequestException('UoM factorToBase must be greater than zero');
  }

  if (from.id === to.id) {
    return qty;
  }

  return qty.mul(fromFactor).div(toFactor);
}

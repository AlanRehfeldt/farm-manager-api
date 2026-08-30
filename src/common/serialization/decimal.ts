import { Decimal } from '@prisma/client/runtime/library';

export function parseDecimal(value: string | number): Decimal {
  const decimal = new Decimal(value);
  if (decimal.isNaN()) {
    throw new Error('Invalid decimal value');
  }
  return decimal;
}

export function decimalToString(
  value: Decimal | null | undefined,
): string | null {
  if (value == null) {
    return null;
  }
  return value.toString();
}

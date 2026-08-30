export function bigintToNumber(
  value: bigint | null | undefined,
): number | null {
  if (value == null) {
    return null;
  }
  return Number(value);
}

export function numberToBigint(value: number): bigint {
  return BigInt(value);
}

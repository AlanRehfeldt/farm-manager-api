import { ConflictException } from '@nestjs/common';

export const DomainConflictCode = {
  DOUBLE_COUNT_BLOCKED: 'DOUBLE_COUNT_BLOCKED',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
} as const;

export type DomainConflictCode =
  (typeof DomainConflictCode)[keyof typeof DomainConflictCode];

export type DomainConflictBody = {
  message: string;
  code: DomainConflictCode;
};

export function domainConflict(
  code: DomainConflictCode,
  message: string,
): ConflictException {
  return new ConflictException({ message, code } satisfies DomainConflictBody);
}

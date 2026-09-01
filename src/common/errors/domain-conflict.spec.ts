import { ConflictException } from '@nestjs/common';
import { DomainConflictCode, domainConflict } from './domain-conflict';

describe('domainConflict', () => {
  it('returns ConflictException with message and code', () => {
    const error = domainConflict(
      DomainConflictCode.INSUFFICIENT_STOCK,
      'Not enough stock',
    );

    expect(error).toBeInstanceOf(ConflictException);
    expect(error.getResponse()).toEqual({
      message: 'Not enough stock',
      code: DomainConflictCode.INSUFFICIENT_STOCK,
    });
  });
});

import { BadRequestException } from '@nestjs/common';
import { resolveOptionalFarmId } from './resolve-optional-farm-id';

describe('resolveOptionalFarmId', () => {
  it('treats omitted farmId as org-wide', () => {
    expect(resolveOptionalFarmId(undefined, 'farm-a')).toBeNull();
    expect(resolveOptionalFarmId(null, 'farm-a')).toBeNull();
  });

  it('accepts farmId equal to the active farm', () => {
    expect(resolveOptionalFarmId('farm-a', 'farm-a')).toBe('farm-a');
  });

  it('rejects farmId that does not match the active farm', () => {
    expect(() => resolveOptionalFarmId('farm-b', 'farm-a')).toThrow(
      BadRequestException,
    );
  });
});

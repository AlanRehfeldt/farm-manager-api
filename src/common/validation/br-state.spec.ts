import {
  brStateSchema,
  optionalNullableBrStateSchema,
} from './br-state';

describe('brStateSchema', () => {
  it('accepts a valid UF', () => {
    expect(brStateSchema.parse('SP')).toBe('SP');
  });

  it('rejects an unknown UF', () => {
    expect(() => brStateSchema.parse('ZZ')).toThrow();
  });

  it('accepts null and undefined on the optional nullable variant', () => {
    expect(optionalNullableBrStateSchema.parse(null)).toBeNull();
    expect(optionalNullableBrStateSchema.parse(undefined)).toBeUndefined();
    expect(optionalNullableBrStateSchema.parse('BA')).toBe('BA');
  });

  it('rejects ZZ on the optional nullable variant', () => {
    expect(() => optionalNullableBrStateSchema.parse('ZZ')).toThrow();
  });
});

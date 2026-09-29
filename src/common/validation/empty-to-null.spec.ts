import z from 'zod';
import { emptyToNull } from './empty-to-null';

describe('emptyToNull', () => {
  const address = emptyToNull(z.string().max(200));

  it('turns a blank string into null', () => {
    expect(address.parse('')).toBeNull();
    expect(address.parse('   ')).toBeNull();
  });

  it('keeps a real value and leaves omission as undefined', () => {
    expect(address.parse('Rua A')).toBe('Rua A');
    expect(address.parse(undefined)).toBeUndefined();
    expect(address.parse(null)).toBeNull();
  });

  it('keeps the original field message when the value is invalid', () => {
    const phone = emptyToNull(
      z.string().regex(/^\d{10,11}$/, {
        message: 'Phone must be 10 or 11 digits.',
      }),
    );

    const result = phone.safeParse('123');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Phone must be 10 or 11 digits.',
      );
    }
  });
});

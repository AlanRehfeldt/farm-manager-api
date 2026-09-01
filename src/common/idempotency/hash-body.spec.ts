import { hashBody } from './hash-body';

describe('hashBody', () => {
  it('produces the same hash for objects with different key order', () => {
    const first = { b: 2, a: 1, nested: { z: 3, y: 2 } };
    const second = { a: 1, nested: { y: 2, z: 3 }, b: 2 };

    expect(hashBody(first)).toBe(hashBody(second));
  });

  it('produces different hashes for different bodies', () => {
    expect(hashBody({ amount: 1 })).not.toBe(hashBody({ amount: 2 }));
  });
});

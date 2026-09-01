import { HttpException } from '@nestjs/common';
import { AuthRateLimitGuard } from './auth-rate-limit.guard';

function createContext(ip = '127.0.0.1') {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        ip,
        headers: {},
      }),
    }),
  };
}

describe('AuthRateLimitGuard', () => {
  it('allows requests under the limit', () => {
    const guard = new AuthRateLimitGuard();

    expect(guard.canActivate(createContext() as never)).toBe(true);
    expect(guard.canActivate(createContext() as never)).toBe(true);
  });

  it('blocks requests after the limit is exceeded', () => {
    const guard = new AuthRateLimitGuard();

    for (let attempt = 0; attempt < 20; attempt += 1) {
      expect(guard.canActivate(createContext() as never)).toBe(true);
    }

    expect(() => guard.canActivate(createContext() as never)).toThrow(
      HttpException,
    );
  });
});

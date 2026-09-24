jest.mock('./token.service', () => ({
  TokenService: class TokenService {},
}));

import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { compare } from 'bcryptjs';
import { hashPassword } from 'src/common/crypto/bcrypt';
import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { ChangePasswordService } from './change-password.service';
import { TokenService } from './token.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

jest.mock('src/common/crypto/bcrypt', () => ({
  hashPassword: jest.fn(),
}));

describe('ChangePasswordService', () => {
  let service: ChangePasswordService;
  let userRepository: jest.Mocked<Pick<UserRepository, 'findById' | 'update'>>;
  let refreshTokenRepository: jest.Mocked<
    Pick<RefreshTokenRepository, 'revokeAllByUserId'>
  >;
  let tokenService: jest.Mocked<
    Pick<TokenService, 'issueTokenPair' | 'setAuthCookies'>
  >;

  const res = {} as Parameters<ChangePasswordService['execute']>[3];

  const user = {
    id: 'user-1',
    password: 'hashed-current',
    mustChangePassword: true,
  } as User;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };
    refreshTokenRepository = {
      revokeAllByUserId: jest.fn(),
    };
    tokenService = {
      issueTokenPair: jest.fn().mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
      }),
      setAuthCookies: jest.fn(),
    };

    service = new ChangePasswordService(
      userRepository as unknown as UserRepository,
      refreshTokenRepository as unknown as RefreshTokenRepository,
      tokenService as unknown as TokenService,
    );

    jest.mocked(compare).mockReset();
    jest.mocked(hashPassword).mockReset();
  });

  it('updates password, clears the flag and rotates tokens', async () => {
    userRepository.findById.mockResolvedValue(user);
    jest.mocked(compare).mockResolvedValue(true as never);
    jest.mocked(hashPassword).mockResolvedValue('hashed-new');

    await service.execute('user-1', 'TempPass1!', 'NewPass1!', res);

    expect(userRepository.update).toHaveBeenCalledWith({
      id: 'user-1',
      password: 'hashed-new',
      mustChangePassword: false,
      passwordChangedAt: expect.any(Date),
    });
    expect(refreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith(
      'user-1',
    );
    expect(tokenService.issueTokenPair).toHaveBeenCalledWith('user-1');
    expect(tokenService.setAuthCookies).toHaveBeenCalledWith(res, {
      accessToken: 'access',
      refreshToken: 'refresh',
    });
    expect(userRepository.update.mock.invocationCallOrder[0]).toBeLessThan(
      tokenService.issueTokenPair.mock.invocationCallOrder[0]!,
    );
  });

  it('rejects an invalid current password', async () => {
    userRepository.findById.mockResolvedValue(user);
    jest.mocked(compare).mockResolvedValue(false as never);

    await expect(
      service.execute('user-1', 'WrongPass1!', 'NewPass1!', res),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects when the new password equals the current password', async () => {
    userRepository.findById.mockResolvedValue(user);
    jest.mocked(compare).mockResolvedValue(true as never);

    await expect(
      service.execute('user-1', 'TempPass1!', 'TempPass1!', res),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare } from 'bcryptjs';
import { Response } from 'express';
import { hashPassword } from 'src/common/crypto/bcrypt';
import {
  USER_REPOSITORY,
  UserRepository,
} from 'src/modules/user/repositories/user.repository';
import {
  REFRESH_TOKEN_REPOSITORY,
  RefreshTokenRepository,
} from '../repositories/refresh-token.repository';
import { TokenService } from './token.service';

@Injectable()
export class ChangePasswordService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(
    userId: string,
    currentPassword: string,
    newPassword: string,
    res: Response,
  ): Promise<{ message: string; result: null }> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    const currentMatches = await compare(currentPassword, user.password);
    if (!currentMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'New password must be different from the current password',
      );
    }

    const encryptedPassword = await hashPassword(newPassword);

    await this.userRepository.update({
      id: userId,
      password: encryptedPassword,
      mustChangePassword: false,
    });

    await this.refreshTokenRepository.revokeAllByUserId(userId);

    const tokens = await this.tokenService.issueTokenPair(userId);
    this.tokenService.setAuthCookies(res, tokens);

    return {
      message: 'Password changed successfully',
      result: null,
    };
  }
}

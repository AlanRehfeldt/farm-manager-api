import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { Response } from 'express';
import {
  USER_REPOSITORY,
  UserRepository,
} from 'src/modules/user/repositories/user.repository';
import { UserDto } from 'src/modules/user/dtos/entity/user.entity';
import { TokenService } from './token.service';

@Injectable()
export class LoginService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(
    email: string,
    password: string,
    res: Response,
  ): Promise<{ message: string; result: UserDto }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.tokenService.issueTokenPair(user.id);
    this.tokenService.setAuthCookies(res, tokens);

    const { password: passwordHash, ...userWithoutPassword } = user;
    void passwordHash;

    return {
      message: 'Logged in successfully',
      result: new UserDto({
        ...userWithoutPassword,
        employeeId: userWithoutPassword.employeeId ?? undefined,
      }),
    };
  }
}

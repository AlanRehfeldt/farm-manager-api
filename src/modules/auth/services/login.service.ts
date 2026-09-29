import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare } from 'bcryptjs';
import { Response } from 'express';
import { isTenantSessionSuspended } from 'src/common/tenancy/tenant-session';
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
    const user = await this.userRepository.findSessionByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (isTenantSessionSuspended(user)) {
      throw new ForbiddenException('Organization is suspended');
    }

    const tokens = await this.tokenService.issueTokenPair(user.id);
    this.tokenService.setAuthCookies(res, tokens);

    const {
      password: passwordHash,
      passwordChangedAt: _passwordChangedAt,
      memberships: _memberships,
      ...userWithoutPassword
    } = user;
    void passwordHash;
    void _passwordChangedAt;
    void _memberships;

    return {
      message: 'Logged in successfully',
      result: new UserDto({
        ...userWithoutPassword,
        employeeId: userWithoutPassword.employeeId ?? undefined,
      }),
    };
  }
}

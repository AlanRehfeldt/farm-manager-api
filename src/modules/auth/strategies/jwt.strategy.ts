import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Env } from 'src/env';
import {
  USER_REPOSITORY,
  UserRepository,
} from 'src/modules/user/repositories/user.repository';
import { AuthenticatedUser } from '../decorators/current-user.decorator';
import { getCookie } from '../utils/get-cookie';

type JwtPayload = {
  sub: string;
  passwordChangedAt?: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService<Env, true>,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {
    const accessCookieName = configService.get('JWT_ACCESS_COOKIE_NAME', {
      infer: true,
    });

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return getCookie(request?.cookies, accessCookieName) ?? null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', { infer: true }),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    const claim = payload.passwordChangedAt;
    if (typeof claim !== 'number' || claim < user.passwordChangedAt.getTime()) {
      throw new UnauthorizedException();
    }

    return {
      userId: user.id,
      mustChangePassword: user.mustChangePassword,
    };
  }
}

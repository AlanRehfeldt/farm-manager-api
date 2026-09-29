import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { OrganizationSelection } from '@prisma/client';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Env } from 'src/env';
import { isTenantSessionSuspended } from 'src/common/tenancy/tenant-session';
import {
  USER_REPOSITORY,
  UserRepository,
} from 'src/modules/user/repositories/user.repository';
import { AuthenticatedUser } from '../decorators/current-user.decorator';
import {
  boundOrganizationStillActive,
  OrganizationSessionScope,
} from '../organization-session';
import { getCookie } from '../utils/get-cookie';

type JwtPayload = {
  sub: string;
  passwordChangedAt?: number;
  organizationSelection?: OrganizationSelection;
  organizationId?: string;
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
    const user = await this.userRepository.findSessionById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    const claim = payload.passwordChangedAt;
    if (typeof claim !== 'number' || claim < user.passwordChangedAt.getTime()) {
      throw new UnauthorizedException();
    }

    if (isTenantSessionSuspended(user)) {
      throw new UnauthorizedException('Organization is suspended');
    }

    const scope = this.readOrganizationScope(payload);

    if (!boundOrganizationStillActive(scope, user.memberships)) {
      throw new UnauthorizedException();
    }

    return {
      userId: user.id,
      mustChangePassword: user.mustChangePassword,
      platformRole: user.platformRole,
      organizationSelection: scope.organizationSelection,
      organizationId: scope.organizationId,
    };
  }

  private readOrganizationScope(payload: JwtPayload): OrganizationSessionScope {
    const selection = payload.organizationSelection;

    if (
      selection !== OrganizationSelection.EXEMPT &&
      selection !== OrganizationSelection.PENDING &&
      selection !== OrganizationSelection.BOUND
    ) {
      throw new UnauthorizedException();
    }

    if (selection === OrganizationSelection.BOUND) {
      if (!payload.organizationId) {
        throw new UnauthorizedException();
      }

      return {
        organizationSelection: selection,
        organizationId: payload.organizationId,
      };
    }

    if (payload.organizationId) {
      throw new UnauthorizedException();
    }

    return {
      organizationSelection: selection,
      organizationId: null,
    };
  }
}

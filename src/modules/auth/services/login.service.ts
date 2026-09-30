import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { OrganizationSelection, PlatformRole } from '@prisma/client';
import { compare } from 'bcryptjs';
import { Response } from 'express';
import { isTenantSessionSuspended } from 'src/common/tenancy/tenant-session';
import {
  USER_REPOSITORY,
  UserRepository,
} from 'src/modules/user/repositories/user.repository';
import { UserDto } from 'src/modules/user/dtos/entity/user.entity';
import {
  ORGANIZATION_REPOSITORY,
  OrganizationRepository,
} from 'src/modules/organization/repositories/organization.repository';
import { resolveLoginOrganizationScope } from '../organization-session';
import { TokenService } from './token.service';

@Injectable()
export class LoginService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: OrganizationRepository,
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

    const scope = resolveLoginOrganizationScope(user);
    const tokens = await this.tokenService.issueTokenPair(user.id, scope);
    this.tokenService.setAuthCookies(res, tokens);

    if (
      user.platformRole === PlatformRole.NONE &&
      scope.organizationSelection === OrganizationSelection.BOUND &&
      scope.organizationId
    ) {
      await this.organizationRepository.touchLastAccessAt(
        scope.organizationId,
        new Date(),
        0,
      );
    }

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

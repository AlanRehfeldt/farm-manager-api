import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { OrganizationSelection, PlatformRole } from '@prisma/client';
import { Response } from 'express';
import { forbiddenOrganization } from 'src/common/tenancy/forbidden-organization';
import {
  USER_REPOSITORY,
  UserRepository,
} from 'src/modules/user/repositories/user.repository';
import { AuthenticatedUser } from '../decorators/current-user.decorator';
import { boundOrganizationStillActive } from '../organization-session';
import { TokenService } from './token.service';

@Injectable()
export class SelectOrganizationService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(
    user: AuthenticatedUser,
    organizationId: string,
    res: Response,
  ): Promise<{ message: string; result: null }> {
    if (user.platformRole !== PlatformRole.NONE) {
      throw new ForbiddenException(
        'Platform users cannot select an organization',
      );
    }

    if (user.organizationSelection !== OrganizationSelection.PENDING) {
      throw new ForbiddenException('Organization selection is not pending');
    }

    const session = await this.userRepository.findSessionById(user.userId);

    if (!session) {
      throw new UnauthorizedException();
    }

    const scope = {
      organizationSelection: OrganizationSelection.BOUND,
      organizationId,
    };

    if (!boundOrganizationStillActive(scope, session.memberships)) {
      throw forbiddenOrganization();
    }

    const tokens = await this.tokenService.revokeAndIssue(user.userId, scope);
    this.tokenService.setAuthCookies(res, tokens);

    return {
      message: 'Organization selected',
      result: null,
    };
  }
}

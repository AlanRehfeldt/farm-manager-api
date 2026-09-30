import { Controller, Delete, HttpStatus, Param } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import z from 'zod';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { ForbiddenDto } from 'src/common/errors/forbidden.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { PlatformAdmin } from 'src/common/platform/platform-admin.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import {
  AuthenticatedUser,
  CurrentUser,
} from 'src/modules/auth/decorators/current-user.decorator';
import { RemovePlatformOrganizationUserResponseDto } from '../dtos/response/remove-platform-organization-user.dto';
import { RemovePlatformOrganizationUserService } from '../services/remove-platform-organization-user.service';

const removePlatformOrganizationUserParamSchema = z.object({
  organizationId: z.uuid(),
  userId: z.uuid(),
});

@ApiTags('Platform')
@PlatformAdmin()
@Controller('/platform/organizations')
export class RemovePlatformOrganizationUserController {
  constructor(
    private readonly removePlatformOrganizationUserService: RemovePlatformOrganizationUserService,
  ) {}

  @ApiOperation({
    summary: 'Remove a user membership from an organization',
  })
  @ApiOkResponse({
    description: 'User removed from organization',
    type: RemovePlatformOrganizationUserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiForbiddenResponse({
    description: 'Platform admin access required',
    type: ForbiddenDto,
  })
  @ApiNotFoundResponse({
    description: 'User does not exist in the organization',
    type: NotFoundDto,
  })
  @ApiConflictResponse({
    description: 'Cannot remove the last admin of the organization',
    type: ConflictDto,
  })
  @Delete('/:organizationId/users/:userId')
  async remove(
    @CurrentUser() actor: AuthenticatedUser,
    @Param(new ZodValidationPipe(removePlatformOrganizationUserParamSchema))
    params: { organizationId: string; userId: string },
  ) {
    await this.removePlatformOrganizationUserService.execute(
      actor.userId,
      params.organizationId,
      params.userId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'User removed from organization',
      result: null,
    };
  }
}

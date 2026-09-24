import { Controller, Delete, HttpStatus, Param, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import z from 'zod';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { ForbiddenDto } from 'src/common/errors/forbidden.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import {
  AuthenticatedUser,
  CurrentUser,
} from 'src/modules/auth/decorators/current-user.decorator';
import { DeleteOrgUserQueryDto } from '../dtos/request/delete-org-user.dto';
import { DeleteOrgUserResponseDto } from '../dtos/response/delete-org-user.dto';
import { DeleteOrgUserService } from '../services/delete-org-user.service';

const deleteOrgUserParamSchema = z.object({
  userId: z.uuid(),
});

const deleteOrgUserQuerySchema = z.object({
  organizationId: z.uuid(),
});

@ApiTags('Membership')
@Controller('/memberships/users')
export class DeleteOrgUserController {
  constructor(private readonly deleteOrgUserService: DeleteOrgUserService) {}

  @ApiOperation({ summary: 'Remove user from organization (all memberships)' })
  @ApiOkResponse({
    description: 'User removed from organization',
    type: DeleteOrgUserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: BadRequestDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiForbiddenResponse({
    description:
      'Only organization admins can delete memberships, or self-removal is forbidden',
    type: ForbiddenDto,
  })
  @ApiConflictResponse({
    description: 'Cannot remove the last admin of the organization',
    type: ConflictDto,
  })
  @ApiNotFoundResponse({
    description: 'User does not exist',
    type: NotFoundDto,
  })
  @Delete(':userId')
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(deleteOrgUserParamSchema))
    param: { userId: string },
    @Query(new ZodValidationPipe(deleteOrgUserQuerySchema))
    query: DeleteOrgUserQueryDto,
  ) {
    await this.deleteOrgUserService.execute(
      user.userId,
      param.userId,
      query.organizationId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'User removed from organization',
      result: null,
    };
  }
}

import { Controller, Delete, HttpStatus, Param } from '@nestjs/common';
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
import { DeleteMembershipParamDto } from '../dtos/request/delete-membership.dto';
import { DeleteMembershipResponseDto } from '../dtos/response/delete-membership.dto';
import { DeleteMembershipService } from '../services/delete-membership.service';

const deleteMembershipParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Membership')
@Controller('/memberships')
export class DeleteMembershipController {
  constructor(
    private readonly deleteMembershipService: DeleteMembershipService,
  ) {}

  @ApiOperation({ summary: 'Delete membership' })
  @ApiOkResponse({
    description: 'Membership deleted successfully',
    type: DeleteMembershipResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiForbiddenResponse({
    description: 'Only organization admins can delete memberships',
    type: ForbiddenDto,
  })
  @ApiConflictResponse({
    description: 'Cannot remove the last admin of the organization',
    type: ConflictDto,
  })
  @ApiNotFoundResponse({
    description: 'Membership does not exist',
    type: NotFoundDto,
  })
  @Delete(':id')
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(deleteMembershipParamSchema))
    param: DeleteMembershipParamDto,
  ) {
    await this.deleteMembershipService.execute(user.userId, param.id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Membership deleted successfully',
      result: null,
    };
  }
}

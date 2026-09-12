import { Body, Controller, HttpStatus, Param, Patch } from '@nestjs/common';
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
import { UpdateOrgUserBodyDto } from '../dtos/request/update-org-user.dto';
import { UpdateOrgUserResponseDto } from '../dtos/response/update-org-user.dto';
import { UpdateOrgUserService } from '../services/update-org-user.service';

const updateOrgUserParamSchema = z.object({
  userId: z.uuid(),
});

const updateOrgUserBodySchema = z.object({
  organizationId: z.uuid(),
  name: z.string().min(5).max(150),
  email: z.email(),
  role: z.enum(['ADMIN', 'USER']),
  farmIds: z.array(z.uuid()),
});

@ApiTags('Membership')
@Controller('/memberships/users')
export class UpdateOrgUserController {
  constructor(private readonly updateOrgUserService: UpdateOrgUserService) {}

  @ApiOperation({
    summary: 'Update organization user (name, email, role, farms)',
  })
  @ApiOkResponse({
    description: 'User updated successfully',
    type: UpdateOrgUserResponseDto,
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
    description: 'Only organization admins can update users',
    type: ForbiddenDto,
  })
  @ApiConflictResponse({
    description: 'Email taken or last admin',
    type: ConflictDto,
  })
  @ApiNotFoundResponse({
    description: 'User or farm does not exist',
    type: NotFoundDto,
  })
  @Patch(':userId')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(updateOrgUserParamSchema))
    param: { userId: string },
    @Body(new ZodValidationPipe(updateOrgUserBodySchema))
    data: UpdateOrgUserBodyDto,
  ) {
    const { memberships } = await this.updateOrgUserService.execute(
      user.userId,
      param.userId,
      data,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'User updated successfully',
      result: memberships,
    };
  }
}

import { Controller, Delete, HttpStatus, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ForbiddenDto } from 'src/common/errors/forbidden.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { DeleteUserService } from '../services/delete-user.service';
import { DeleteUserParamDto } from '../dtos/request/delete-user.dto';
import { DeleteUserResponseDto } from '../dtos/response/delete-user.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import {
  AuthenticatedUser,
  CurrentUser,
} from 'src/modules/auth/decorators/current-user.decorator';

const deleteUserParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('User')
@Controller('/users')
export class DeleteUserController {
  constructor(private readonly deleteUserService: DeleteUserService) {}

  @ApiOperation({ summary: 'Delete user' })
  @ApiCreatedResponse({
    description: 'User deleted successfully',
    type: DeleteUserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication',
    type: UnauthorizedDto,
  })
  @ApiForbiddenResponse({
    description: 'Caller cannot delete this user',
    type: ForbiddenDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: User does not exist',
    type: NotFoundDto,
  })
  @Delete(':id')
  async delete(
    @CurrentUser() actor: AuthenticatedUser,
    @Param(new ZodValidationPipe(deleteUserParamSchema))
    param: DeleteUserParamDto,
  ) {
    await this.deleteUserService.execute(actor.userId, param.id);

    return {
      statusCode: HttpStatus.OK,
      message: 'User deleted successfully',
      result: null,
    };
  }
}

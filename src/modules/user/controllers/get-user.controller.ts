import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ForbiddenDto } from 'src/common/errors/forbidden.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { GetUserService } from '../services/get-user.service';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { GetUserParamDto } from '../dtos/request/get-user.dto';
import { GetUserResponseDto } from '../dtos/response/get-user.dto';
import {
  AuthenticatedUser,
  CurrentUser,
} from 'src/modules/auth/decorators/current-user.decorator';

const getUserParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('User')
@Controller('/users')
export class GetUserController {
  constructor(private readonly getUserService: GetUserService) {}

  @ApiOperation({ summary: 'Get user' })
  @ApiOkResponse({
    description: 'User retrived successfully',
    type: GetUserResponseDto,
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
    description: 'Caller cannot access this user',
    type: ForbiddenDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: User does not exist',
    type: NotFoundDto,
  })
  @Get(':id')
  async get(
    @CurrentUser() actor: AuthenticatedUser,
    @Param(new ZodValidationPipe(getUserParamSchema))
    param: GetUserParamDto,
  ) {
    const { user } = await this.getUserService.execute(actor.userId, param.id);

    return {
      statusCode: HttpStatus.OK,
      message: 'User retrived successfully',
      user,
    };
  }
}

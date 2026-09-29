import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
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
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ForbiddenDto } from 'src/common/errors/forbidden.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { PlatformAdmin } from 'src/common/platform/platform-admin.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { passwordSchema } from 'src/common/validation/password-schema';
import {
  ResetPlatformUserPasswordBodyDto,
  ResetPlatformUserPasswordParamDto,
} from '../dtos/request/reset-platform-user-password.dto';
import { ResetPlatformUserPasswordResponseDto } from '../dtos/response/reset-platform-user-password.dto';
import { ResetPlatformUserPasswordService } from '../services/reset-platform-user-password.service';

const resetPlatformUserPasswordParamSchema = z.object({
  id: z.uuid(),
});

const resetPlatformUserPasswordBodySchema = z.object({
  password: passwordSchema,
});

@ApiTags('Platform')
@PlatformAdmin()
@Controller('/platform/users')
export class ResetPlatformUserPasswordController {
  constructor(
    private readonly resetPlatformUserPasswordService: ResetPlatformUserPasswordService,
  ) {}

  @ApiOperation({
    summary: 'Reset a user password and revoke active sessions',
  })
  @ApiOkResponse({
    description: 'Password reset successfully',
    type: ResetPlatformUserPasswordResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
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
    description: 'User does not exist',
    type: NotFoundDto,
  })
  @Post('/:id/reset-password')
  @HttpCode(HttpStatus.OK)
  async reset(
    @Param(new ZodValidationPipe(resetPlatformUserPasswordParamSchema))
    params: ResetPlatformUserPasswordParamDto,
    @Body(new ZodValidationPipe(resetPlatformUserPasswordBodySchema))
    data: ResetPlatformUserPasswordBodyDto,
  ) {
    await this.resetPlatformUserPasswordService.execute(
      params.id,
      data.password,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Password reset successfully',
      result: null,
    };
  }
}

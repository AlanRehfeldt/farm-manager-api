import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import z from 'zod';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ForbiddenDto } from 'src/common/errors/forbidden.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { passwordSchema } from 'src/common/validation/password-schema';
import { AllowMustChangePassword } from '../decorators/allow-must-change-password.decorator';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../decorators/current-user.decorator';
import { ChangePasswordBodyDto } from '../dtos/request/change-password.dto';
import { MessageResponseDto } from '../dtos/response/message.dto';
import { ChangePasswordService } from '../services/change-password.service';

const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1, { message: 'Password is required.' }),
  newPassword: passwordSchema,
});

@ApiTags('Auth')
@Controller('/auth')
export class ChangePasswordController {
  constructor(private readonly changePasswordService: ChangePasswordService) {}

  @AllowMustChangePassword()
  @ApiOperation({ summary: 'Change password (required on first access)' })
  @ApiOkResponse({
    description: 'Password updated; new auth cookies issued',
    type: MessageResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or new password equals current',
    type: BadRequestDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid current password',
    type: UnauthorizedDto,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
    type: ForbiddenDto,
  })
  @Post('/change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(changePasswordBodySchema))
    data: ChangePasswordBodyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.changePasswordService.execute(
      user.userId,
      data.currentPassword,
      data.newPassword,
      res,
    );

    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }
}

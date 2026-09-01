import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import z from 'zod';
import { AuthRateLimitGuard } from 'src/common/http/auth-rate-limit.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { Public } from '../decorators/public.decorator';
import { LoginBodyDto } from '../dtos/request/login.dto';
import { LoginResponseDto } from '../dtos/response/login.dto';
import { LoginService } from '../services/login.service';

const loginBodySchema = z.object({
  email: z.email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

@ApiTags('Auth')
@Controller('/auth')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Public()
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiOkResponse({
    description: 'Sets httpOnly access and refresh cookies',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    type: UnauthorizedDto,
  })
  @Post('/login')
  @UseGuards(AuthRateLimitGuard)
  @UsePipes(new ZodValidationPipe(loginBodySchema))
  async login(
    @Body() data: LoginBodyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.loginService.execute(
      data.email,
      data.password,
      res,
    );

    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }
}

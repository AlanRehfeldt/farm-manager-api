import { Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Public } from '../decorators/public.decorator';
import { MessageResponseDto } from '../dtos/response/message.dto';
import { LogoutService } from '../services/logout.service';

@ApiTags('Auth')
@Controller('/auth')
export class LogoutController {
  constructor(private readonly logoutService: LogoutService) {}

  @Public()
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiOkResponse({
    description: 'Clears auth cookies',
    type: MessageResponseDto,
  })
  @Post('/logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.logoutService.execute(req, res);

    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }
}

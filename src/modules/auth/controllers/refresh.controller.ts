import { Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { Public } from '../decorators/public.decorator';
import { MessageResponseDto } from '../dtos/response/message.dto';
import { RefreshService } from '../services/refresh.service';

@ApiTags('Auth')
@Controller('/auth')
export class RefreshController {
  constructor(private readonly refreshService: RefreshService) {}

  @Public()
  @ApiOperation({ summary: 'Refresh access token using refresh cookie' })
  @ApiOkResponse({
    description: 'Issues new access and refresh cookies',
    type: MessageResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid refresh token',
    type: UnauthorizedDto,
  })
  @Post('/refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.refreshService.execute(req, res);

    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }
}

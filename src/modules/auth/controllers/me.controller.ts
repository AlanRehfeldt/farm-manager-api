import { Controller, Get, HttpStatus } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../decorators/current-user.decorator';
import { MeResponseDto } from '../dtos/response/me.dto';
import { MeService } from '../services/me.service';

@ApiTags('Auth')
@Controller('/auth')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiOkResponse({
    description: 'Authenticated user',
    type: MeResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiNotFoundResponse({
    description: 'User does not exist',
    type: NotFoundDto,
  })
  @Get('/me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    const result = await this.meService.execute(user.userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'User retrieved successfully',
      result,
    };
  }
}

import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import z from 'zod';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import {
  AuthenticatedUser,
  CurrentUser,
} from 'src/modules/auth/decorators/current-user.decorator';
import { GetFarmParamDto } from '../dtos/request/get-farm.dto';
import { GetFarmResponseDto } from '../dtos/response/get-farm.dto';
import { GetFarmService } from '../services/get-farm.service';

const getFarmParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Farm')
@Controller('/farms')
export class GetFarmController {
  constructor(private readonly getFarmService: GetFarmService) {}

  @ApiOperation({ summary: 'Get farm' })
  @ApiOkResponse({
    description: 'Farm retrieved successfully',
    type: GetFarmResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiNotFoundResponse({
    description: 'Farm does not exist',
    type: NotFoundDto,
  })
  @Get(':id')
  async get(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(getFarmParamSchema)) param: GetFarmParamDto,
  ) {
    const { farm } = await this.getFarmService.execute(param.id, user.userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Farm retrieved successfully',
      result: farm,
    };
  }
}

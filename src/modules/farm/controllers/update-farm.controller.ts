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
import {
  UpdateFarmBodyDto,
  UpdateFarmParamDto,
} from '../dtos/request/update-farm.dto';
import { UpdateFarmResponseDto } from '../dtos/response/update-farm.dto';
import { UpdateFarmService } from '../services/update-farm.service';

const updateFarmParamSchema = z.object({
  id: z.uuid(),
});

const updateFarmBodySchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' })
    .optional(),
  timezone: z.string().max(64).nullable().optional(),
});

@ApiTags('Farm')
@Controller('/farms')
export class UpdateFarmController {
  constructor(private readonly updateFarmService: UpdateFarmService) {}

  @ApiOperation({ summary: 'Update farm' })
  @ApiOkResponse({
    description: 'Farm updated successfully',
    type: UpdateFarmResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request',
    type: BadRequestDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiForbiddenResponse({
    description: 'Only organization admins can update farms',
    type: ForbiddenDto,
  })
  @ApiConflictResponse({
    description: 'Farm name already exists in this organization',
    type: ConflictDto,
  })
  @ApiNotFoundResponse({
    description: 'Farm does not exist',
    type: NotFoundDto,
  })
  @Patch(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(updateFarmParamSchema))
    param: UpdateFarmParamDto,
    @Body(new ZodValidationPipe(updateFarmBodySchema)) data: UpdateFarmBodyDto,
  ) {
    const { farm } = await this.updateFarmService.execute(user.userId, {
      id: param.id,
      name: data.name,
      timezone: data.timezone,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Farm updated successfully',
      result: farm,
    };
  }
}

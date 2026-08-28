import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import z from 'zod';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { ForbiddenDto } from 'src/common/errors/forbidden.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import {
  AuthenticatedUser,
  CurrentUser,
} from 'src/modules/auth/decorators/current-user.decorator';
import { CreateFarmBodyDto } from '../dtos/request/create-farm.dto';
import { CreateFarmResponseDto } from '../dtos/response/create-farm.dto';
import { CreateFarmService } from '../services/create-farm.service';

const createFarmBodySchema = z.object({
  organizationId: z.uuid(),
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' }),
  timezone: z.string().max(64).optional(),
});

@ApiTags('Farm')
@Controller('/farms')
export class CreateFarmController {
  constructor(private readonly createFarmService: CreateFarmService) {}

  @ApiOperation({ summary: 'Create farm' })
  @ApiCreatedResponse({
    description: 'Farm created successfully',
    type: CreateFarmResponseDto,
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
    description: 'Only organization admins can create farms',
    type: ForbiddenDto,
  })
  @ApiConflictResponse({
    description: 'Farm name already exists in this organization',
    type: ConflictDto,
  })
  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createFarmBodySchema))
    data: CreateFarmBodyDto,
  ) {
    const { farm } = await this.createFarmService.execute(user.userId, data);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Farm created successfully',
      result: farm,
    };
  }
}

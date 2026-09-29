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
import { CreateOnboardingBodyDto } from '../dtos/request/create-onboarding.dto';
import { CreateOnboardingResponseDto } from '../dtos/response/create-onboarding.dto';
import { CreateOnboardingService } from '../services/create-onboarding.service';

const createOnboardingBodySchema = z.object({
  farmName: z
    .string()
    .min(2, { message: 'Farm name must be at least 2 characters long.' })
    .max(150, { message: 'Farm name must be at most 150 characters long.' }),
  timezone: z.string().max(64).optional(),
});

@ApiTags('Onboarding')
@Controller('/onboarding')
export class CreateOnboardingController {
  constructor(
    private readonly createOnboardingService: CreateOnboardingService,
  ) {}

  @ApiOperation({
    summary: 'Create the first farm of an already provisioned organization',
  })
  @ApiCreatedResponse({
    description: 'First farm created successfully',
    type: CreateOnboardingResponseDto,
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
    description: 'Only organization admins can create the first farm',
    type: ForbiddenDto,
  })
  @ApiConflictResponse({
    description:
      'Organization is missing, already has a farm, or the user belongs to more than one organization',
    type: ConflictDto,
  })
  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createOnboardingBodySchema))
    data: CreateOnboardingBodyDto,
  ) {
    const { organization, farm } = await this.createOnboardingService.execute(
      user.userId,
      data,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'First farm created successfully',
      result: { organization, farm },
    };
  }
}

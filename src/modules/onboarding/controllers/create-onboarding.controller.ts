import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import z from 'zod';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
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
  organizationName: z
    .string()
    .min(2, {
      message: 'Organization name must be at least 2 characters long.',
    })
    .max(150, {
      message: 'Organization name must be at most 150 characters long.',
    }),
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

  @ApiOperation({ summary: 'Create organization and first farm in one flow' })
  @ApiCreatedResponse({
    description: 'Onboarding completed successfully',
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
  @ApiConflictResponse({
    description: 'User already belongs to an organization',
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
      message: 'Onboarding completed successfully',
      result: { organization, farm },
    };
  }
}

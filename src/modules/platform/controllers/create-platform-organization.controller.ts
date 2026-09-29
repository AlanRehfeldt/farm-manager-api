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
import { PlatformAdmin } from 'src/common/platform/platform-admin.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import {
  AuthenticatedUser,
  CurrentUser,
} from 'src/modules/auth/decorators/current-user.decorator';
import { passwordSchema } from 'src/common/validation/password-schema';
import { CreatePlatformOrganizationBodyDto } from '../dtos/request/create-platform-organization.dto';
import { CreatePlatformOrganizationResponseDto } from '../dtos/response/create-platform-organization.dto';
import { CreatePlatformOrganizationService } from '../services/create-platform-organization.service';

const createPlatformOrganizationBodySchema = z.object({
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
  admin: z.object({
    name: z
      .string()
      .min(5, { message: 'Name must be at least 5 characters long.' })
      .max(150, { message: 'Name must be at most 150 characters long.' }),
    email: z
      .email({ message: 'Invalid email address.' })
      .min(10, { message: 'Email must be at least 10 characters long.' })
      .max(100, { message: 'Email must be at most 100 characters long.' }),
    password: passwordSchema,
  }),
});

@ApiTags('Platform')
@PlatformAdmin()
@Controller('/platform/organizations')
export class CreatePlatformOrganizationController {
  constructor(
    private readonly createPlatformOrganizationService: CreatePlatformOrganizationService,
  ) {}

  @ApiOperation({
    summary: 'Provision organization, first farm and client ADMIN',
  })
  @ApiCreatedResponse({
    description: 'Organization provisioned successfully',
    type: CreatePlatformOrganizationResponseDto,
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
    description: 'Platform admin access required',
    type: ForbiddenDto,
  })
  @ApiConflictResponse({
    description: 'Email already exists',
    type: ConflictDto,
  })
  @Post()
  async create(
    @CurrentUser() actor: AuthenticatedUser,
    @Body(new ZodValidationPipe(createPlatformOrganizationBodySchema))
    data: CreatePlatformOrganizationBodyDto,
  ) {
    const result = await this.createPlatformOrganizationService.execute(
      data,
      actor.userId,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Organization provisioned successfully',
      result,
    };
  }
}

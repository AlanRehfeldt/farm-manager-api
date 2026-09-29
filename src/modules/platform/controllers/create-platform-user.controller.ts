import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
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
import { PlatformAdmin } from 'src/common/platform/platform-admin.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import {
  AuthenticatedUser,
  CurrentUser,
} from 'src/modules/auth/decorators/current-user.decorator';
import { passwordSchema } from 'src/common/validation/password-schema';
import { CreatePlatformUserBodyDto } from '../dtos/request/create-platform-user.dto';
import { CreatePlatformUserResponseDto } from '../dtos/response/create-platform-user.dto';
import { CreatePlatformUserService } from '../services/create-platform-user.service';

const createPlatformUserBodySchema = z.object({
  organizationId: z.uuid(),
  name: z
    .string()
    .min(5, { message: 'Name must be at least 5 characters long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' }),
  email: z
    .email({ message: 'Invalid email address.' })
    .min(10, { message: 'Email must be at least 10 characters long.' })
    .max(100, { message: 'Email must be at most 100 characters long.' }),
  password: passwordSchema,
  role: z.enum(['ADMIN', 'USER']).optional(),
  farmIds: z.array(z.uuid()).optional(),
});

@ApiTags('Platform')
@PlatformAdmin()
@Controller('/platform/users')
export class CreatePlatformUserController {
  constructor(
    private readonly createPlatformUserService: CreatePlatformUserService,
  ) {}

  @ApiOperation({
    summary: 'Create a client user attached to an organization',
  })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: CreatePlatformUserResponseDto,
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
  @ApiNotFoundResponse({
    description: 'Organization or farm does not exist',
    type: NotFoundDto,
  })
  @ApiConflictResponse({
    description: 'Email already exists',
    type: ConflictDto,
  })
  @Post()
  async create(
    @CurrentUser() actor: AuthenticatedUser,
    @Body(new ZodValidationPipe(createPlatformUserBodySchema))
    data: CreatePlatformUserBodyDto,
  ) {
    const result = await this.createPlatformUserService.execute(
      actor.userId,
      data,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      result,
    };
  }
}

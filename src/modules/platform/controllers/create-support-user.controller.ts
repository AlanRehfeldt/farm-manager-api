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
import { passwordSchema } from 'src/common/validation/password-schema';
import {
  AuthenticatedUser,
  CurrentUser,
} from 'src/modules/auth/decorators/current-user.decorator';
import { CreateSupportUserResponseDto } from '../dtos/response/support-access.dto';
import { CreateSupportUserService } from '../services/create-support-user.service';

const createSupportUserBodySchema = z.object({
  name: z
    .string()
    .min(5, { message: 'Name must be at least 5 characters long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' }),
  email: z
    .email({ message: 'Invalid email address.' })
    .min(10, { message: 'Email must be at least 10 characters long.' })
    .max(100, { message: 'Email must be at most 100 characters long.' }),
  password: passwordSchema,
});

class CreateSupportUserBodyDto {
  name!: string;
  email!: string;
  password!: string;
}

@ApiTags('Platform')
@PlatformAdmin()
@Controller('/platform/support-users')
export class CreateSupportUserController {
  constructor(private readonly createSupportUserService: CreateSupportUserService) {}

  @ApiOperation({ summary: 'Create a platform support user without membership' })
  @ApiCreatedResponse({ type: CreateSupportUserResponseDto })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedDto })
  @ApiForbiddenResponse({ type: ForbiddenDto })
  @ApiConflictResponse({ type: ConflictDto })
  @Post()
  async create(
    @CurrentUser() actor: AuthenticatedUser,
    @Body(new ZodValidationPipe(createSupportUserBodySchema))
    data: CreateSupportUserBodyDto,
  ) {
    const result = await this.createSupportUserService.execute(
      actor.userId,
      data,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Support user created successfully',
      result,
    };
  }
}

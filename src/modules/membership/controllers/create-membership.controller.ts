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
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { passwordSchema } from 'src/common/validation/password-schema';
import {
  AuthenticatedUser,
  CurrentUser,
} from 'src/modules/auth/decorators/current-user.decorator';
import { CreateMembershipBodyDto } from '../dtos/request/create-membership.dto';
import { CreateMembershipResponseDto } from '../dtos/response/create-membership.dto';
import { CreateMembershipService } from '../services/create-membership.service';

const createMembershipBodySchema = z
  .object({
    organizationId: z.uuid(),
    farmId: z.uuid().nullable().optional(),
    farmIds: z.array(z.uuid()).optional(),
    role: z.enum(['ADMIN', 'USER']).optional(),
    userId: z.uuid().optional(),
    name: z.string().min(5).max(150).optional(),
    email: z.email().optional(),
    password: passwordSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.userId) {
      return;
    }

    if (!data.name || !data.email || !data.password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Provide userId or name, email and password',
      });
    }
  });

@ApiTags('Membership')
@Controller('/memberships')
export class CreateMembershipController {
  constructor(
    private readonly createMembershipService: CreateMembershipService,
  ) {}

  @ApiOperation({ summary: 'Create membership (invite or attach user)' })
  @ApiCreatedResponse({
    description: 'Membership created successfully',
    type: CreateMembershipResponseDto,
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
    description: 'Only organization admins can create memberships',
    type: ForbiddenDto,
  })
  @ApiConflictResponse({
    description: 'Membership or email already exists',
    type: ConflictDto,
  })
  @ApiNotFoundResponse({
    description: 'User or farm does not exist',
    type: NotFoundDto,
  })
  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createMembershipBodySchema))
    data: CreateMembershipBodyDto,
  ) {
    const { membership } = await this.createMembershipService.execute(
      user.userId,
      data,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Membership created successfully',
      result: membership,
    };
  }
}

import { Body, Controller, HttpStatus, Post, UsePipes } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { PlatformAdmin } from 'src/common/platform/platform-admin.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { passwordSchema } from 'src/common/validation/password-schema';
import { CreateUserService } from '../services/create-user.service';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { CreateUserResponseDto } from '../dtos/response/create-user.dto';
import { CreateUserBodyDto } from '../dtos/request/create-user.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';

const createUserBodySchema = z.object({
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
  employeeId: z.uuid({ message: 'Invalid UUID for employeeId.' }).optional(),
});

@ApiTags('User')
@Controller('/users')
export class CreateUserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @PlatformAdmin()
  @ApiOperation({ summary: 'Create user' })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: CreateUserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Email already exists',
    type: ConflictDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Employee does not exist',
    type: NotFoundDto,
  })
  @Post()
  @UsePipes(new ZodValidationPipe(createUserBodySchema))
  async create(@Body() data: CreateUserBodyDto) {
    const { user } = await this.createUserService.execute(data);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      result: user,
    };
  }
}

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
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
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
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long.' })
    .max(20, { message: 'Password must be at most 20 characters long.' })
    .regex(/[a-z]/, {
      message: 'Password must contain at least one lowercase letter.',
    })
    .regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter.',
    })
    .regex(/[0-9]/, {
      message: 'Password must contain at least one number.',
    })
    .regex(/[^A-Za-z0-9]/, {
      message: 'Password must contain at least one special character.',
    }),
  role: z.enum(['ADMIN', 'USER']).optional(),
  employeeId: z.uuid({ message: 'Invalid UUID for employeeId.' }).optional(),
});

@ApiTags('User')
@Controller('/users')
export class CreateUserController {
  constructor(private readonly createUserService: CreateUserService) {}

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
    try {
      const { user } = await this.createUserService.execute(data);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'User created successfully',
        result: user,
      };
    } catch (error) {
      console.error('Error creating user', error);
      throw error;
    }
  }
}

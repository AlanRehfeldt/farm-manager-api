import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { CreateUserService } from '../services/create-user.service';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { CreateUserResponseDto } from '../dtos/response/create-user.dto';
import { CreateUserRequestDto } from '../dtos/request/create-user.dto';

const createUserSchema = z.object({
  name: z.string().min(5).max(150),
  email: z.email().min(10).max(100),
  password: z.string().min(8).max(100),
  role: z.enum(['ADMIN', 'USER']).optional(),
  employeeId: z.uuid().optional(),
});

@ApiTags('User')
@Controller('/users')
export class CreateUserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @ApiOperation({ summary: 'Create a new user' })
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
  @Post()
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async create(@Body() data: CreateUserRequestDto) {
    try {
      const { user } = await this.createUserService.execute(data);
      return { user };
    } catch (error) {
      console.error('Error creating user', error);
      throw error;
    }
  }
}

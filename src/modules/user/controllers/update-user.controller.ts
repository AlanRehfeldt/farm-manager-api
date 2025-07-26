import { Body, Controller, HttpStatus, Param, Put } from '@nestjs/common';
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
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { UpdateUserService } from '../services/update-user.service';
import { UpdateUserResponseDto } from '../dtos/response/update-user.dto';
import {
  UpdateUserBodyDto,
  UpdateUserParamDto,
} from '../dtos/request/update-user.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';

const updateUserParamSchema = z.object({
  id: z.uuid(),
});

const updateUserSchema = z.object({
  name: z.string().min(5).max(150).optional(),
  email: z.email().min(10).max(100).optional(),
  employeeId: z.uuid().optional(),
});

@ApiTags('User')
@Controller('/users')
export class UpdateUserController {
  constructor(private readonly updateUserService: UpdateUserService) {}

  @ApiOperation({ summary: 'Update user' })
  @ApiCreatedResponse({
    description: 'User updated successfully',
    type: UpdateUserResponseDto,
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
    description: 'Not found: User/Employee does not exists',
    type: NotFoundDto,
  })
  @Put(':id')
  async update(
    @Param(new ZodValidationPipe(updateUserParamSchema))
    param: UpdateUserParamDto,
    @Body(new ZodValidationPipe(updateUserSchema)) data: UpdateUserBodyDto,
  ) {
    try {
      const { user } = await this.updateUserService.execute({
        id: param.id,
        ...data,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'User updated successfully',
        user,
      };
    } catch (error) {
      console.error('Error updating user', error);
      throw error;
    }
  }
}

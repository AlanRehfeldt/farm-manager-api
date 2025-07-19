import { Controller, Delete, HttpStatus, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { DeleteUserService } from '../services/delete-user.service';
import { DeleteUserParamDto } from '../dtos/request/delete-user.dto';
import { DeleteUserResponseDto } from '../dtos/response/delete-user.dto';

const deleteUserParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('User')
@Controller('/users')
export class DeleteUserController {
  constructor(private readonly deleteUserService: DeleteUserService) {}

  @ApiOperation({ summary: 'Delete user' })
  @ApiCreatedResponse({
    description: 'User deleted successfully',
    type: DeleteUserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @Delete(':id')
  async delete(
    @Param(new ZodValidationPipe(deleteUserParamSchema))
    param: DeleteUserParamDto,
  ) {
    try {
      await this.deleteUserService.execute(param.id);
      return {
        statusCode: HttpStatus.OK,
        message: 'User deleted successfully',
        result: null,
      };
    } catch (error) {
      console.error('Error deleting user', error);
      throw error;
    }
  }
}

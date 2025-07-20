import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { GetUserService } from '../services/get-user.service';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { GetUserParamDto } from '../dtos/request/get-user.dto';
import { GetUserResponseDto } from '../dtos/response/get-user.dto';

const getUserParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('User')
@Controller('/users')
export class GetUserController {
  constructor(private readonly getUserService: GetUserService) {}

  @ApiOperation({ summary: 'Get user' })
  @ApiOkResponse({
    description: 'User retrived successfully',
    type: GetUserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'User does not exist',
    type: NotFoundDto,
  })
  @Get(':id')
  async get(
    @Param(new ZodValidationPipe(getUserParamSchema))
    param: GetUserParamDto,
  ) {
    try {
      const { user } = await this.getUserService.execute(param.id);

      return {
        statusCode: HttpStatus.OK,
        message: 'User retrived successfully',
        user,
      };
    } catch (error) {
      console.error('Error getting user', error);
      throw error;
    }
  }
}

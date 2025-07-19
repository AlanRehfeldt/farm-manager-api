import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { FetchUsersService } from '../services/fetch-users.service';
import { FetchUsersRequestDto } from '../dtos/request/fetch-users';
import { FetchUsersResponseDto } from '../dtos/response/fetch-users.dto';

const fetchUsersSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  role: z.enum(['ADMIN', 'USER']).optional(),
  employeeId: z.uuid().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('name'),
  orderDirection: z.string().optional().default('asc'),
});

@ApiTags('User')
@Controller('/users')
export class FetchUserController {
  constructor(private readonly fetchUsersService: FetchUsersService) {}

  @ApiOperation({ summary: 'List users' })
  @ApiOkResponse({
    description: 'Users retrived successfully',
    type: FetchUsersResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @Get()
  @UsePipes(new ZodValidationPipe(fetchUsersSchema))
  async fetch(@Query() params: FetchUsersRequestDto) {
    try {
      const { results, total, page, perPage } =
        await this.fetchUsersService.execute(params);
      return { results, total, page, perPage };
    } catch (error) {
      console.error('Error fetching users', error);
      throw error;
    }
  }
}

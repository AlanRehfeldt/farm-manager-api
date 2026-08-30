import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { PlatformAdmin } from 'src/common/platform/platform-admin.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { FetchUsersService } from '../services/fetch-users.service';
import { FetchUsersQueryDto } from '../dtos/request/fetch-users.dto';
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
export class FetchUsersController {
  constructor(private readonly fetchUsersService: FetchUsersService) {}

  @PlatformAdmin()
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
  async fetch(@Query() query: FetchUsersQueryDto) {
    const { results, total, page, perPage, orderBy, orderDirection } =
      await this.fetchUsersService.execute(query);

    return {
      results,
      total,
      page,
      perPage,
      orderBy,
      orderDirection,
    };
  }
}

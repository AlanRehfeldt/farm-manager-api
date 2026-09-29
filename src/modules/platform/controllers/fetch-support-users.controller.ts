import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import z from 'zod';
import { ForbiddenDto } from 'src/common/errors/forbidden.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { PlatformAdmin } from 'src/common/platform/platform-admin.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { FetchSupportUsersResponseDto } from '../dtos/response/support-access.dto';
import { FetchSupportUsersService } from '../services/fetch-support-users.service';

const fetchSupportUsersSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.enum(['name', 'createdAt']).optional().default('name'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('asc'),
});

@ApiTags('Platform')
@PlatformAdmin()
@Controller('/platform/support-users')
export class FetchSupportUsersController {
  constructor(
    private readonly fetchSupportUsersService: FetchSupportUsersService,
  ) {}

  @ApiOperation({ summary: 'List platform support users' })
  @ApiOkResponse({ type: FetchSupportUsersResponseDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedDto })
  @ApiForbiddenResponse({ type: ForbiddenDto })
  @Get()
  async fetch(
    @Query(new ZodValidationPipe(fetchSupportUsersSchema))
    query: z.infer<typeof fetchSupportUsersSchema>,
  ) {
    return this.fetchSupportUsersService.execute({
      name: query.name,
      email: query.email,
      page: query.page,
      perPage: query.perPage,
      orderBy: query.orderBy,
      orderDirection: query.orderDirection,
    });
  }
}

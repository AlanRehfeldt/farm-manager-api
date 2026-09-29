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
import { FetchSupportAccessResponseDto } from '../dtos/response/support-access.dto';
import { FetchSupportAccessService } from '../services/fetch-support-access.service';

const fetchSupportAccessSchema = z.object({
  organizationId: z.uuid().optional(),
  userId: z.uuid().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.enum(['createdAt']).optional().default('createdAt'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('desc'),
});

@ApiTags('Platform')
@PlatformAdmin()
@Controller('/platform/support-access')
export class FetchSupportAccessController {
  constructor(
    private readonly fetchSupportAccessService: FetchSupportAccessService,
  ) {}

  @ApiOperation({ summary: 'List active support access grants' })
  @ApiOkResponse({ type: FetchSupportAccessResponseDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedDto })
  @ApiForbiddenResponse({ type: ForbiddenDto })
  @Get()
  async fetch(
    @Query(new ZodValidationPipe(fetchSupportAccessSchema))
    query: z.infer<typeof fetchSupportAccessSchema>,
  ) {
    return this.fetchSupportAccessService.execute({
      organizationId: query.organizationId,
      userId: query.userId,
      page: query.page,
      perPage: query.perPage,
      orderBy: query.orderBy,
      orderDirection: query.orderDirection,
    });
  }
}

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
import { FetchAuditLogsResponseDto } from '../dtos/response/support-access.dto';
import { FetchAuditLogsService } from '../services/fetch-audit-logs.service';

const fetchAuditLogsSchema = z.object({
  organizationId: z.uuid().optional(),
  actorUserId: z.uuid().optional(),
  action: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.enum(['createdAt']).optional().default('createdAt'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('desc'),
});

@ApiTags('Platform')
@PlatformAdmin()
@Controller('/platform/audit-logs')
export class FetchAuditLogsController {
  constructor(private readonly fetchAuditLogsService: FetchAuditLogsService) {}

  @ApiOperation({ summary: 'List platform audit log entries' })
  @ApiOkResponse({ type: FetchAuditLogsResponseDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedDto })
  @ApiForbiddenResponse({ type: ForbiddenDto })
  @Get()
  async fetch(
    @Query(new ZodValidationPipe(fetchAuditLogsSchema))
    query: z.infer<typeof fetchAuditLogsSchema>,
  ) {
    return this.fetchAuditLogsService.execute({
      organizationId: query.organizationId,
      actorUserId: query.actorUserId,
      action: query.action,
      page: query.page,
      perPage: query.perPage,
      orderBy: query.orderBy,
      orderDirection: query.orderDirection,
    });
  }
}

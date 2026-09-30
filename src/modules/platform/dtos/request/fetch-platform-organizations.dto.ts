import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationStatus } from '@prisma/client';

export class FetchPlatformOrganizationsQueryDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional({ enum: OrganizationStatus })
  status?: OrganizationStatus;

  @ApiPropertyOptional({ enum: ['active7d', 'active30d', 'silent30d'] })
  usage?: 'active7d' | 'active30d' | 'silent30d';

  @ApiPropertyOptional({ enum: ['stale30d'] })
  access?: 'stale30d';

  @ApiPropertyOptional({ default: 1 })
  page?: number;

  @ApiPropertyOptional({ default: 10, maximum: 100 })
  perPage?: number;

  @ApiPropertyOptional({
    enum: ['name', 'createdAt', 'lastAccessAt', 'lastActivityAt'],
    default: 'name',
  })
  orderBy?: 'name' | 'createdAt' | 'lastAccessAt' | 'lastActivityAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  orderDirection?: 'asc' | 'desc';
}

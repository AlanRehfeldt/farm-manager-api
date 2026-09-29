import { ApiPropertyOptional } from '@nestjs/swagger';

export class FetchPlatformUsersQueryDto {
  @ApiPropertyOptional()
  organizationId?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional({ default: 1 })
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  perPage?: number;

  @ApiPropertyOptional({
    enum: ['name', 'email', 'createdAt'],
    default: 'name',
  })
  orderBy?: 'name' | 'email' | 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  orderDirection?: 'asc' | 'desc';
}

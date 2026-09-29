import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FetchPlatformOrganizationFarmsParamDto {
  @ApiProperty({ example: 'uuid' })
  organizationId!: string;
}

export class FetchPlatformOrganizationFarmsQueryDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional({ default: 1 })
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  perPage?: number;

  @ApiPropertyOptional({ enum: ['name', 'createdAt'], default: 'name' })
  orderBy?: 'name' | 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  orderDirection?: 'asc' | 'desc';
}

import { ApiPropertyOptional } from '@nestjs/swagger';

export class FetchFarmsQueryDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  organizationId?: string;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  perPage?: number;

  @ApiPropertyOptional()
  orderBy?: string;

  @ApiPropertyOptional()
  orderDirection?: 'asc' | 'desc';
}

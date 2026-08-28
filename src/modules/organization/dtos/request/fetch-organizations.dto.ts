import { ApiPropertyOptional } from '@nestjs/swagger';

export class FetchOrganizationsQueryDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  perPage?: number;

  @ApiPropertyOptional()
  orderBy?: string;

  @ApiPropertyOptional()
  orderDirection?: 'asc' | 'desc';
}

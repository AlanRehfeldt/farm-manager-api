import { ApiPropertyOptional } from '@nestjs/swagger';

export class FetchUnitOfMeasurementsQueryDto {
  @ApiPropertyOptional()
  id: string;

  @ApiPropertyOptional()
  name: string;

  @ApiPropertyOptional()
  acronym: string;

  @ApiPropertyOptional()
  page: number;

  @ApiPropertyOptional()
  perPage: number;

  @ApiPropertyOptional()
  orderBy: string;

  @ApiPropertyOptional()
  orderDirection: 'asc' | 'desc';
}

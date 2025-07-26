import { ApiPropertyOptional } from '@nestjs/swagger';

export class FetchProductsQueryDto {
  @ApiPropertyOptional()
  id: string;

  @ApiPropertyOptional()
  name: string;

  @ApiPropertyOptional()
  description: string;

  @ApiPropertyOptional()
  unitOfMeasurementId: string;

  @ApiPropertyOptional()
  page: number;

  @ApiPropertyOptional()
  perPage: number;

  @ApiPropertyOptional()
  orderBy: string;

  @ApiPropertyOptional()
  orderDirection: 'asc' | 'desc';
}

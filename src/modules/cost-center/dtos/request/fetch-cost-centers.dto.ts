import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderableCostCenterField } from '../../repositories/@types';

export class FetchCostCentersQueryDto {
  @ApiPropertyOptional()
  id!: string;

  @ApiPropertyOptional()
  name!: string;

  @ApiPropertyOptional()
  description!: string;

  @ApiPropertyOptional()
  code!: string;

  @ApiPropertyOptional()
  parentId!: string;

  @ApiPropertyOptional()
  page!: number;

  @ApiPropertyOptional()
  perPage!: number;

  @ApiPropertyOptional()
  orderBy!: OrderableCostCenterField;

  @ApiPropertyOptional()
  orderDirection!: 'asc' | 'desc';
}

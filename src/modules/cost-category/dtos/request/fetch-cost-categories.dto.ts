import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderableCostCategoryField } from '../../repositories/@types';

export class FetchCostCategoriesQueryDto {
  @ApiPropertyOptional()
  id!: string;

  @ApiPropertyOptional()
  name!: string;

  @ApiPropertyOptional()
  code!: string;

  @ApiPropertyOptional()
  page!: number;

  @ApiPropertyOptional()
  perPage!: number;

  @ApiPropertyOptional()
  orderBy!: OrderableCostCategoryField;

  @ApiPropertyOptional()
  orderDirection!: 'asc' | 'desc';
}

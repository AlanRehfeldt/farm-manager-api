import { ApiProperty } from '@nestjs/swagger';
import { CostCategoryDto } from '../entity/cost-category.entity';

export class FetchCostCategoriesResponseDto {
  @ApiProperty({ type: [CostCategoryDto] })
  results!: CostCategoryDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty({ default: 1 })
  page!: number;

  @ApiProperty({ default: 10 })
  perPage!: number;

  @ApiProperty({ default: 'name' })
  orderBy!: string;

  @ApiProperty({ default: 'asc' })
  orderDirection!: string;
}

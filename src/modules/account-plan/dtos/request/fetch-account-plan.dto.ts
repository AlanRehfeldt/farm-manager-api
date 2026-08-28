import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderableAccountPlanField } from '../../repositories/@types';

export class FetchAccountPlansQueryDto {
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
  orderBy!: OrderableAccountPlanField;

  @ApiPropertyOptional()
  orderDirection!: 'asc' | 'desc';
}

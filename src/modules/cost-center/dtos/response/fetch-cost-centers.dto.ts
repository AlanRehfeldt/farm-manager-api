import { ApiProperty } from '@nestjs/swagger';
import { CostCenterDto } from '../entity/cost-center.entity';

export class FetchCostCentersResponseDto {
  @ApiProperty({
    type: [CostCenterDto],
  })
  results!: CostCenterDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty({
    default: 1,
  })
  page!: number;

  @ApiProperty({
    default: 10,
  })
  perPage!: number;

  @ApiProperty({
    default: 'name',
  })
  orderBy!: number;

  @ApiProperty({
    default: 'asc',
  })
  orderDirection!: number;
}

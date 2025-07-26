import { ApiProperty } from '@nestjs/swagger';
import { AccountPlanDto } from '../entity/account-plan.entity';

export class FetchAccountPlansResponseDto {
  @ApiProperty({
    type: [AccountPlanDto],
  })
  results: AccountPlanDto[];

  @ApiProperty()
  total: number;

  @ApiProperty({
    default: 1,
  })
  page: number;

  @ApiProperty({
    default: 10,
  })
  perPage: number;

  @ApiProperty({
    default: 'name',
  })
  orderBy: number;

  @ApiProperty({
    default: 'asc',
  })
  orderDirection: number;
}

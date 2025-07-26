import { ApiProperty } from '@nestjs/swagger';
import { InstallmentDto } from '../entity/installment.entity';

export class FetchInstallmentsResponseDto {
  @ApiProperty({
    type: [InstallmentDto],
  })
  results: InstallmentDto[];

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

import { ApiProperty } from '@nestjs/swagger';
import { SupplierDto } from '../entity/supplier.entity';

export class FetchSuppliersResponseDto {
  @ApiProperty({
    type: [SupplierDto],
  })
  results!: SupplierDto[];

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

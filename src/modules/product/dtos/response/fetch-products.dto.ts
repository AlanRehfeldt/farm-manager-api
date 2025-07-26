import { ApiProperty } from '@nestjs/swagger';
import { ProductDto } from '../entity/product.entity';

export class FetchProductsResponseDto {
  @ApiProperty({
    type: [ProductDto],
  })
  results: ProductDto[];

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

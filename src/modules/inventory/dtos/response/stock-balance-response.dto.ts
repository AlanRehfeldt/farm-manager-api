import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FetchStockBalancesQueryDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional({ default: 1 })
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  perPage?: number;

  @ApiPropertyOptional({ default: 'name' })
  orderBy?: string;

  @ApiPropertyOptional({ default: 'asc' })
  orderDirection?: string;
}

export class StockBalanceProductDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  unitOfMeasurement!: {
    id: string;
    name: string;
    acronym: string;
  };
}

export class StockBalanceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  farmId!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  quantityOnHand!: string;

  @ApiProperty()
  avgCost!: string;

  @ApiProperty({ type: StockBalanceProductDto })
  product!: StockBalanceProductDto;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class FetchStockBalancesResponseDto {
  @ApiProperty({ type: [StockBalanceDto] })
  results!: StockBalanceDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  perPage!: number;

  @ApiProperty()
  orderBy!: string;

  @ApiProperty()
  orderDirection!: string;
}

import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class StockAdjustmentResultDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  productName!: string;

  @ApiProperty()
  quantity!: string;

  @ApiProperty()
  date!: Date;

  @ApiProperty()
  note!: string;

  @ApiProperty()
  quantityOnHand!: string;

  @ApiProperty()
  avgCost!: string;
}

export class CreateStockAdjustmentResponseDto {
  @ApiProperty({ default: HttpStatus.CREATED })
  statusCode!: number;

  @ApiProperty({ default: 'Stock adjustment created successfully' })
  message!: string;

  @ApiProperty()
  result!: StockAdjustmentResultDto;
}

import { ApiProperty } from '@nestjs/swagger';

export class CreateStockAdjustmentBodyDto {
  @ApiProperty()
  productId!: string;

  @ApiProperty({
    description: 'Signed quantity (negative for loss, positive for gain)',
    example: '-5',
  })
  quantity!: string;

  @ApiProperty()
  date!: Date;

  @ApiProperty({ example: 'Quebra de estoque' })
  note!: string;
}

import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ProductDto } from '../entity/product.entity';

export class UpdateProductResponseDto {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode!: string;

  @ApiProperty({
    default: 'Product updated successfully',
  })
  message!: string;

  @ApiProperty()
  result!: ProductDto;
}

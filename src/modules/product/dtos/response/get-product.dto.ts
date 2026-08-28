import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ProductDto } from '../entity/product.entity';

export class GetProductResponseDto {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode!: string;

  @ApiProperty({
    default: 'Product retrived successfully',
  })
  message!: string;

  @ApiProperty()
  result!: ProductDto;
}

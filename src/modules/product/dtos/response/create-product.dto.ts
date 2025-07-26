import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { ProductDto } from '../entity/product.entity';

export class CreateProductResponseDto {
  @ApiProperty({
    default: HttpStatus.CREATED,
  })
  statusCode: string;

  @ApiProperty({
    default: 'Product created successfully',
  })
  message: string;

  @ApiProperty()
  result: ProductDto;
}

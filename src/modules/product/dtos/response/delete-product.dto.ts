import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteProductResponseDto {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode!: string;

  @ApiProperty({
    default: 'Product deleted successfully',
  })
  message!: string;

  @ApiProperty({ default: null, nullable: true, type: 'null' })
  result!: null;
}

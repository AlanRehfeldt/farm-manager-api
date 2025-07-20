import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteSupplierResponseDto {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode: string;

  @ApiProperty({
    default: 'Supplier updated successfully',
  })
  message: string;

  @ApiProperty({ default: null, nullable: true, type: 'null' })
  result: null;
}

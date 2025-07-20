import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { SupplierDto } from '../entity/supplier.entity';

export class CreateSupplierResponseDto {
  @ApiProperty({
    default: HttpStatus.CREATED,
  })
  statusCode: string;

  @ApiProperty({
    default: 'Supplier created successfully',
  })
  message: string;

  @ApiProperty()
  result: SupplierDto;
}

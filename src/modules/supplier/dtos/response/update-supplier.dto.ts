import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { SupplierDto } from '../entity/supplier.entity';

export class UpdateSupplierResponseDto {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode!: string;

  @ApiProperty({
    default: 'Supplier updated successfully',
  })
  message!: string;

  @ApiProperty()
  result!: SupplierDto;
}

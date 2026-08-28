import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { SupplierDto } from '../entity/supplier.entity';

export class GetSupplierResponseDto {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode!: string;

  @ApiProperty({
    default: 'Supplier retrived successfully',
  })
  message!: string;

  @ApiProperty()
  result!: SupplierDto;
}

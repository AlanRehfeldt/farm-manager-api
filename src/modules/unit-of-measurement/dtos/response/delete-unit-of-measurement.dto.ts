import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteUnitOfMeasurementResponseDto {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode: string;

  @ApiProperty({
    default: 'Unit of measurement deleted successfully',
  })
  message: string;

  @ApiProperty({ default: null, nullable: true, type: 'null' })
  result: null;
}

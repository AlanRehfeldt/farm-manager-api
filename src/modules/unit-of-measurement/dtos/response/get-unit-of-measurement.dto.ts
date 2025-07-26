import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { UnitOfMeasurementDto } from '../entity/unit-of-measurement.entity';

export class GetUnitOfMeasurementResponseDto {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode: string;

  @ApiProperty({
    default: 'Unit of measurement retrived successfully',
  })
  message: string;

  @ApiProperty()
  result: UnitOfMeasurementDto;
}

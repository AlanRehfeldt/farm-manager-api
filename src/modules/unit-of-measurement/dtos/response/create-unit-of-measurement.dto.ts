import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { UnitOfMeasurementDto } from '../entity/unit-of-measurement.entity';

export class CreateUnitOfMeasurementResponseDto {
  @ApiProperty({
    default: HttpStatus.CREATED,
  })
  statusCode: string;

  @ApiProperty({
    default: 'Unit of measurement created successfully',
  })
  message: string;

  @ApiProperty()
  result: UnitOfMeasurementDto;
}

import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { UnitOfMeasurementDto } from '../entity/unit-of-measurement.entity';

export class UpdateUnitOfMeasurementResponseDto {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode!: string;

  @ApiProperty({
    default: 'Unit of measurement updated successfully',
  })
  message!: string;

  @ApiProperty()
  result!: UnitOfMeasurementDto;
}

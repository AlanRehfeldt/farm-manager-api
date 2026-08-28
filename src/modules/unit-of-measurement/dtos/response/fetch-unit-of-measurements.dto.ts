import { ApiProperty } from '@nestjs/swagger';
import { UnitOfMeasurementDto } from '../entity/unit-of-measurement.entity';

export class FetchUnitOfMeasurementsResponseDto {
  @ApiProperty({
    type: [UnitOfMeasurementDto],
  })
  results!: UnitOfMeasurementDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty({
    default: 1,
  })
  page!: number;

  @ApiProperty({
    default: 10,
  })
  perPage!: number;

  @ApiProperty({
    default: 'name',
  })
  orderBy!: number;

  @ApiProperty({
    default: 'asc',
  })
  orderDirection!: number;
}

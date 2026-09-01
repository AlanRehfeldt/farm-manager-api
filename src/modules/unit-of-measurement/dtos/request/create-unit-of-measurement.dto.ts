import { ApiProperty } from '@nestjs/swagger';
import { UomDimension } from '@prisma/client';

export class CreateUnitOfMeasurementBodyDto {
  @ApiProperty({
    example: 'Liter',
    description: "Unit of measurement's name",
  })
  name!: string;

  @ApiProperty({
    example: 'L',
    description: "Unit of measurement's acronym",
  })
  acronym!: string;

  @ApiProperty({
    enum: UomDimension,
    example: UomDimension.MASS,
    description: 'Physical dimension of the unit',
  })
  dimension!: UomDimension;

  @ApiProperty({
    example: true,
    description: 'Whether this is the base unit for its dimension in the org',
  })
  isBase!: boolean;

  @ApiProperty({
    example: '1',
    description: 'Conversion factor to the base unit of the same dimension',
  })
  factorToBase!: string;
}

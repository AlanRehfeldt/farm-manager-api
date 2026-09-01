import { ApiPropertyOptional } from '@nestjs/swagger';
import { UomDimension } from '@prisma/client';

export class UpdateUnitOfMeasurementParamDto {
  @ApiPropertyOptional({
    description: "Unit of measurement's unique identifier",
  })
  id!: string;
}

export class UpdateUnitOfMeasurementBodyDto {
  @ApiPropertyOptional({
    description: "Unit of measurement's name",
  })
  name!: string;

  @ApiPropertyOptional({
    description: "Unit of measurement's acronym",
  })
  acronym!: string;

  @ApiPropertyOptional({
    enum: UomDimension,
    description: 'Physical dimension of the unit',
  })
  dimension!: UomDimension;

  @ApiPropertyOptional({
    description: 'Whether this is the base unit for its dimension in the org',
  })
  isBase!: boolean;

  @ApiPropertyOptional({
    example: '1',
    description: 'Conversion factor to the base unit of the same dimension',
  })
  factorToBase!: string;
}

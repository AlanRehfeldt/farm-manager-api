import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUnitOfMeasurementParamDto {
  @ApiProperty({
    description: "Unit of measurement's unique identifier",
  })
  id: string;
}

export class UpdateUnitOfMeasurementBodyDto {
  @ApiPropertyOptional({
    description: "Unit of measurement's name",
  })
  name: string;

  @ApiPropertyOptional({
    description: "Unit of measurement's acronym",
  })
  acronym: string;
}

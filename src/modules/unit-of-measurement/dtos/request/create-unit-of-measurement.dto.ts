import { ApiProperty } from '@nestjs/swagger';

export class CreateUnitOfMeasurementBodyDto {
  @ApiProperty({
    example: 'Liter',
    description: "Unit of measurement's name",
  })
  name: string;

  @ApiProperty({
    example: 'L',
    description: "Unit of measurement's acronym",
  })
  acronym: string;
}

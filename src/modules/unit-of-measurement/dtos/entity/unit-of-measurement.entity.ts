import { ApiProperty } from '@nestjs/swagger';

export class UnitOfMeasurementDto {
  @ApiProperty({
    example: 'uuid',
    description: "Unit of measurement's unique identifier",
  })
  id!: string;

  @ApiProperty({
    example: 'uuid',
    description: "Unit of measurement's organization identifier",
  })
  organizationId!: string;

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
    example: '2023-01-01T00:00:00.000Z',
    description: "Unit of measurement's creation date",
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: "Unit of measurement's update date",
  })
  updatedAt!: Date;

  constructor(partial: Partial<UnitOfMeasurementDto>) {
    Object.assign(this, partial);
  }
}

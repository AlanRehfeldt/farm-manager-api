import { ApiProperty } from '@nestjs/swagger';

export class MachineDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'uuid' })
  farmId!: string;

  @ApiProperty({ example: 'Trator JD 6120' })
  name!: string;

  @ApiProperty({ example: 15000, description: 'Hourly cost in cents' })
  hourlyCostInCents!: number;

  @ApiProperty({ example: true })
  fuelIncludedInHourlyCost!: boolean;

  @ApiProperty({ example: true })
  active!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

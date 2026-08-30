import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMachineBodyDto {
  @ApiProperty({ example: 'Trator JD 6120' })
  name!: string;

  @ApiProperty({ example: 15000 })
  hourlyCostInCents!: number;

  @ApiPropertyOptional({ example: true })
  fuelIncludedInHourlyCost?: boolean;

  @ApiPropertyOptional({ example: true })
  active?: boolean;
}

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMachineBodyDto {
  @ApiPropertyOptional({ example: 'Trator JD 6120' })
  name?: string;

  @ApiPropertyOptional({ example: 15000 })
  hourlyCostInCents?: number;

  @ApiPropertyOptional({ example: true })
  fuelIncludedInHourlyCost?: boolean;

  @ApiPropertyOptional({ example: true })
  active?: boolean;
}

export class UpdateMachineParamDto {
  @ApiPropertyOptional({ example: 'uuid' })
  id!: string;
}

export class GetMachineParamDto {
  @ApiPropertyOptional({ example: 'uuid' })
  id!: string;
}

export class DeleteMachineParamDto {
  @ApiPropertyOptional({ example: 'uuid' })
  id!: string;
}

export class FetchMachinesQueryDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  active?: boolean;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  perPage?: number;

  @ApiPropertyOptional()
  orderBy?: string;

  @ApiPropertyOptional()
  orderDirection?: string;
}

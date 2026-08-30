import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CropSummaryDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Manga' })
  name!: string;
}

export class CropSeasonDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  farmId!: string;

  @ApiProperty()
  cropId!: string;

  @ApiProperty({ example: 'Manga 25/26' })
  name!: string;

  @ApiProperty()
  startDate!: Date;

  @ApiPropertyOptional()
  endDate!: Date | null;

  @ApiProperty({ enum: ['PLANNED', 'ACTIVE', 'CLOSED'] })
  status!: string;

  @ApiProperty()
  productionUomId!: string;

  @ApiPropertyOptional({ example: 1500 })
  referenceSalePriceInCents!: number | null;

  @ApiProperty()
  crop!: CropSummaryDto;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class CropPlantingDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  cropSeasonId!: string;

  @ApiProperty()
  fieldId!: string;

  @ApiPropertyOptional()
  varietyId!: string | null;

  @ApiPropertyOptional({ example: '85.500000' })
  plantedAreaHa!: string | null;

  @ApiProperty()
  field!: {
    id: string;
    name: string;
    areaHa: string;
  };

  @ApiPropertyOptional()
  variety!: {
    id: string;
    name: string;
  } | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

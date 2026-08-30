import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCropSeasonBodyDto {
  @ApiProperty({ example: 'Manga 25/26' })
  name!: string;

  @ApiProperty()
  cropId!: string;

  @ApiProperty()
  startDate!: Date;

  @ApiPropertyOptional()
  endDate?: Date | null;

  @ApiProperty()
  productionUomId!: string;

  @ApiPropertyOptional({ example: 1500 })
  referenceSalePriceInCents?: number | null;
}

export class UpdateCropSeasonBodyDto {
  @ApiPropertyOptional({ example: 'Manga 25/26' })
  name?: string;

  @ApiPropertyOptional()
  startDate?: Date;

  @ApiPropertyOptional()
  endDate?: Date | null;

  @ApiPropertyOptional()
  productionUomId?: string;

  @ApiPropertyOptional({ example: 1500 })
  referenceSalePriceInCents?: number | null;
}

export class CreateCropPlantingBodyDto {
  @ApiProperty()
  cropSeasonId!: string;

  @ApiProperty()
  fieldId!: string;

  @ApiPropertyOptional()
  varietyId?: string | null;

  @ApiPropertyOptional({ example: '85.5' })
  plantedAreaHa?: string | number | null;
}

export class UpdateCropPlantingBodyDto {
  @ApiPropertyOptional()
  varietyId?: string | null;

  @ApiPropertyOptional({ example: '85.5' })
  plantedAreaHa?: string | number | null;
}

export class CropSeasonParamDto {
  @ApiPropertyOptional({ example: 'uuid' })
  id!: string;
}

export class CropPlantingParamDto {
  @ApiPropertyOptional({ example: 'uuid' })
  id!: string;
}

export class FetchCropSeasonsQueryDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional({ enum: ['PLANNED', 'ACTIVE', 'CLOSED'] })
  status?: string;

  @ApiPropertyOptional()
  cropId?: string;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  perPage?: number;

  @ApiPropertyOptional()
  orderBy?: string;

  @ApiPropertyOptional()
  orderDirection?: string;
}

export class FetchCropPlantingsQueryDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiPropertyOptional()
  cropSeasonId?: string;

  @ApiPropertyOptional()
  fieldId?: string;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  perPage?: number;

  @ApiPropertyOptional()
  orderBy?: string;

  @ApiPropertyOptional()
  orderDirection?: string;
}

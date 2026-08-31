import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const qualityClasses = [
  'EXPORT',
  'DOMESTIC',
  'INDUSTRY',
  'REJECT',
  'OTHER',
] as const;

export class CreateHarvestItemBodyDto {
  @ApiProperty({ enum: qualityClasses, default: 'OTHER' })
  qualityClass!: (typeof qualityClasses)[number];

  @ApiProperty({ example: '20000' })
  quantity!: string;

  @ApiPropertyOptional()
  uomId?: string;
}

export class CreateHarvestBodyDto {
  @ApiProperty()
  cropSeasonId!: string;

  @ApiProperty()
  fieldId!: string;

  @ApiProperty()
  date!: Date;

  @ApiPropertyOptional()
  lotCode?: string;

  @ApiPropertyOptional()
  note?: string;

  @ApiProperty({ type: [CreateHarvestItemBodyDto] })
  items!: CreateHarvestItemBodyDto[];
}

export class FetchHarvestsQueryDto {
  @ApiProperty()
  cropSeasonId!: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional({ default: 1 })
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  perPage?: number;

  @ApiPropertyOptional({ default: 'date' })
  orderBy?: string;

  @ApiPropertyOptional({ default: 'desc' })
  orderDirection?: string;
}

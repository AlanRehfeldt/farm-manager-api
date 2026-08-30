import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const activityTypes = [
  'PREPARATION',
  'FERTILIZATION',
  'PHYTOSANITARY',
  'IRRIGATION',
  'MANAGEMENT',
  'HARVEST',
  'OTHER',
] as const;

export class CreateActivityInputBodyDto {
  @ApiProperty()
  productId!: string;

  @ApiProperty({ example: '100' })
  quantity!: string;
}

export class CreateActivityBodyDto {
  @ApiProperty()
  cropSeasonId!: string;

  @ApiProperty()
  fieldId!: string;

  @ApiProperty({ enum: activityTypes })
  activityType!: (typeof activityTypes)[number];

  @ApiProperty()
  date!: Date;

  @ApiPropertyOptional()
  note?: string;

  @ApiProperty({ type: [CreateActivityInputBodyDto] })
  inputs!: CreateActivityInputBodyDto[];
}

export class FetchActivitiesQueryDto {
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

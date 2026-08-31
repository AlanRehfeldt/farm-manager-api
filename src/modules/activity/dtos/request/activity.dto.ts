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

const payBasisValues = ['HOUR', 'DAY', 'OUTPUT'] as const;

export class CreateActivityInputBodyDto {
  @ApiProperty()
  productId!: string;

  @ApiProperty({ example: '100' })
  quantity!: string;
}

export class CreateActivityLaborBodyDto {
  @ApiPropertyOptional()
  employeeId?: string;

  @ApiPropertyOptional()
  contractorName?: string;

  @ApiProperty({ enum: payBasisValues })
  payBasis!: (typeof payBasisValues)[number];

  @ApiPropertyOptional({ example: '4' })
  hours?: string;

  @ApiPropertyOptional({ example: '1' })
  days?: string;

  @ApiPropertyOptional({ example: '100' })
  outputQty?: string;

  @ApiProperty({ example: 20000 })
  costInCents!: number;
}

export class CreateActivityMachineHourBodyDto {
  @ApiProperty()
  machineId!: string;

  @ApiProperty({ example: '3' })
  hours!: string;
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

  @ApiProperty({ type: [CreateActivityLaborBodyDto] })
  labor!: CreateActivityLaborBodyDto[];

  @ApiProperty({ type: [CreateActivityMachineHourBodyDto] })
  machineHours!: CreateActivityMachineHourBodyDto[];
}

export class FetchActivitiesQueryDto {
  @ApiProperty()
  cropSeasonId!: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional({ enum: activityTypes })
  activityType?: (typeof activityTypes)[number];

  @ApiPropertyOptional()
  dateFrom?: Date;

  @ApiPropertyOptional()
  dateTo?: Date;

  @ApiPropertyOptional({ default: 1 })
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  perPage?: number;

  @ApiPropertyOptional({ default: 'date' })
  orderBy?: string;

  @ApiPropertyOptional({ default: 'desc' })
  orderDirection?: string;
}

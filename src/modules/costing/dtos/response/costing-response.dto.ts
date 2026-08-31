import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryBreakdownDto {
  @ApiProperty()
  costCategoryId!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  amountInCents!: number;
}

export class SourceBreakdownDto {
  @ApiProperty()
  sourceType!: string;

  @ApiProperty()
  amountInCents!: number;
}

export class FieldCostingDto {
  @ApiProperty()
  fieldId!: string;

  @ApiProperty()
  fieldName!: string;

  @ApiProperty()
  areaHa!: string;

  @ApiProperty()
  harvestedQuantity!: string;

  @ApiProperty()
  totalCostInCents!: number;

  @ApiPropertyOptional({ nullable: true })
  costPerHaInCents!: number | null;

  @ApiPropertyOptional({ nullable: true })
  costPerUnitInCents!: number | null;
}

export class SeasonCostingDto {
  @ApiProperty()
  cropSeasonId!: string;

  @ApiProperty({ enum: ['PLANNED', 'ACTIVE', 'CLOSED'] })
  status!: string;

  @ApiProperty({ enum: ['LIVE', 'SNAPSHOT'] })
  source!: string;

  @ApiPropertyOptional({ nullable: true })
  closedAt!: string | null;

  @ApiProperty()
  totalCostInCents!: number;

  @ApiProperty()
  areaHa!: string;

  @ApiProperty()
  harvestedQuantity!: string;

  @ApiProperty()
  productionUomId!: string;

  @ApiProperty()
  productionUomAcronym!: string;

  @ApiPropertyOptional({ nullable: true })
  costPerHaInCents!: number | null;

  @ApiPropertyOptional({ nullable: true })
  costPerUnitInCents!: number | null;

  @ApiPropertyOptional({ nullable: true })
  referenceSalePriceInCents!: number | null;

  @ApiPropertyOptional({ nullable: true })
  estimatedMarginPerUnitInCents!: number | null;

  @ApiProperty({ type: [CategoryBreakdownDto] })
  breakdownByCategory!: CategoryBreakdownDto[];

  @ApiProperty({ type: [SourceBreakdownDto] })
  breakdownBySource!: SourceBreakdownDto[];

  @ApiProperty({ type: [FieldCostingDto] })
  byField!: FieldCostingDto[];
}

export class GetCropSeasonCostingResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Crop season costing retrieved successfully' })
  message!: string;

  @ApiProperty({ type: SeasonCostingDto })
  result!: SeasonCostingDto;
}

export class CloseCropSeasonResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Crop season closed successfully' })
  message!: string;

  @ApiProperty({ type: SeasonCostingDto })
  result!: SeasonCostingDto;
}

export class UpdateReferencePriceResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Reference price updated successfully' })
  message!: string;

  @ApiProperty({ type: SeasonCostingDto })
  result!: SeasonCostingDto;
}

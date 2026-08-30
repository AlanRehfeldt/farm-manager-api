import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class ActivityInputDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  productName!: string;

  @ApiProperty()
  uomAcronym!: string;

  @ApiProperty()
  quantity!: string;

  @ApiProperty()
  unitCostSnapshot!: string;

  @ApiProperty()
  amountInCents!: number;
}

export class ActivityStockEffectDto {
  @ApiProperty()
  productName!: string;

  @ApiProperty()
  quantity!: string;

  @ApiProperty()
  uomAcronym!: string;

  @ApiProperty()
  quantityRemaining!: string;

  @ApiProperty()
  amountInCents!: number;

  @ApiProperty()
  insufficient!: boolean;
}

export class ActivityDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  farmId!: string;

  @ApiProperty()
  cropSeasonId!: string;

  @ApiProperty()
  cropSeasonName!: string;

  @ApiProperty()
  cropName!: string;

  @ApiProperty()
  fieldId!: string;

  @ApiProperty()
  fieldName!: string;

  @ApiProperty()
  activityType!: string;

  @ApiProperty()
  date!: Date;

  @ApiProperty({ nullable: true })
  note!: string | null;

  @ApiProperty({ type: [ActivityInputDto] })
  inputs!: ActivityInputDto[];

  @ApiProperty()
  totalCostInCents!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class CreateActivityResponseDto {
  @ApiProperty({ default: HttpStatus.CREATED })
  statusCode!: number;

  @ApiProperty({ default: 'Activity created successfully' })
  message!: string;

  @ApiProperty()
  result!: ActivityDto & { stockEffects: ActivityStockEffectDto[] };
}

export class FetchActivitiesResponseDto {
  @ApiProperty({ type: [ActivityDto] })
  results!: ActivityDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  perPage!: number;

  @ApiProperty()
  orderBy!: string;

  @ApiProperty()
  orderDirection!: string;
}

export class GetActivityResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Activity retrieved successfully' })
  message!: string;

  @ApiProperty()
  result!: ActivityDto;
}

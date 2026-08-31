import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class HarvestItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  qualityClass!: string;

  @ApiProperty()
  quantity!: string;

  @ApiProperty()
  uomId!: string;

  @ApiProperty()
  uomAcronym!: string;
}

export class HarvestDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  farmId!: string;

  @ApiProperty()
  cropSeasonId!: string;

  @ApiProperty()
  cropSeasonName!: string;

  @ApiProperty()
  fieldId!: string;

  @ApiProperty()
  fieldName!: string;

  @ApiProperty()
  date!: Date;

  @ApiProperty({ nullable: true })
  lotCode!: string | null;

  @ApiProperty({ nullable: true })
  note!: string | null;

  @ApiProperty({ type: [HarvestItemDto] })
  items!: HarvestItemDto[];

  @ApiProperty()
  totalQuantity!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class CreateHarvestResponseDto {
  @ApiProperty({ example: HttpStatus.CREATED })
  statusCode!: number;

  @ApiProperty()
  message!: string;

  @ApiProperty({ type: HarvestDto })
  result!: HarvestDto;
}

export class GetHarvestResponseDto {
  @ApiProperty({ example: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty()
  message!: string;

  @ApiProperty({ type: HarvestDto })
  result!: HarvestDto;
}

export class FetchHarvestsResponseDto {
  @ApiProperty({ type: [HarvestDto] })
  results!: HarvestDto[];

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

  @ApiProperty()
  harvestedQuantity!: string;

  @ApiProperty()
  productionUomId!: string;
}

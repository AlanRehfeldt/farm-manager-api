import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { VarietyDto } from '../entity/variety.entity';

export class CreateVarietyResponseDto {
  @ApiProperty({ default: HttpStatus.CREATED })
  statusCode!: number;

  @ApiProperty({ default: 'Variety created successfully' })
  message!: string;

  @ApiProperty()
  result!: VarietyDto;
}

export class GetVarietyResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Variety retrieved successfully' })
  message!: string;

  @ApiProperty()
  result!: VarietyDto;
}

export class UpdateVarietyResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Variety updated successfully' })
  message!: string;

  @ApiProperty()
  result!: VarietyDto;
}

export class DeleteVarietyResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Variety deleted successfully' })
  message!: string;

  @ApiProperty({ default: null, nullable: true, type: 'null' })
  result!: null;
}

export class FetchVarietiesResponseDto {
  @ApiProperty({ type: [VarietyDto] })
  results!: VarietyDto[];

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

import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { FieldDto } from '../entity/field.entity';

export class CreateFieldResponseDto {
  @ApiProperty({ default: HttpStatus.CREATED })
  statusCode!: number;

  @ApiProperty({ default: 'Field created successfully' })
  message!: string;

  @ApiProperty()
  result!: FieldDto;
}

export class GetFieldResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Field retrieved successfully' })
  message!: string;

  @ApiProperty()
  result!: FieldDto;
}

export class UpdateFieldResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Field updated successfully' })
  message!: string;

  @ApiProperty()
  result!: FieldDto;
}

export class DeleteFieldResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Field deleted successfully' })
  message!: string;

  @ApiProperty({ nullable: true })
  result!: null;
}

export class FetchFieldsResponseDto {
  @ApiProperty({ type: [FieldDto] })
  results!: FieldDto[];

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

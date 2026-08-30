import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CropDto } from '../entity/crop.entity';

export class CreateCropResponseDto {
  @ApiProperty({ default: HttpStatus.CREATED })
  statusCode!: number;

  @ApiProperty({ default: 'Crop created successfully' })
  message!: string;

  @ApiProperty()
  result!: CropDto;
}

export class GetCropResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Crop retrieved successfully' })
  message!: string;

  @ApiProperty()
  result!: CropDto;
}

export class UpdateCropResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Crop updated successfully' })
  message!: string;

  @ApiProperty()
  result!: CropDto;
}

export class DeleteCropResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Crop deleted successfully' })
  message!: string;

  @ApiProperty({ nullable: true })
  result!: null;
}

export class FetchCropsResponseDto {
  @ApiProperty({ type: [CropDto] })
  results!: CropDto[];

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

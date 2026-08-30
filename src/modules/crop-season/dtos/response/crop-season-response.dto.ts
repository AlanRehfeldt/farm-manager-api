import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CropPlantingDto, CropSeasonDto } from '../entity/crop-season.entity';

export class CreateCropSeasonResponseDto {
  @ApiProperty({ default: HttpStatus.CREATED })
  statusCode!: number;

  @ApiProperty({ default: 'Crop season created successfully' })
  message!: string;

  @ApiProperty()
  result!: CropSeasonDto;
}

export class GetCropSeasonResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Crop season retrieved successfully' })
  message!: string;

  @ApiProperty()
  result!: CropSeasonDto;
}

export class UpdateCropSeasonResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Crop season updated successfully' })
  message!: string;

  @ApiProperty()
  result!: CropSeasonDto;
}

export class DeleteCropSeasonResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Crop season deleted successfully' })
  message!: string;

  @ApiProperty({ nullable: true })
  result!: null;
}

export class FetchCropSeasonsResponseDto {
  @ApiProperty({ type: [CropSeasonDto] })
  results!: CropSeasonDto[];

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

export class ActivateCropSeasonResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Crop season activated successfully' })
  message!: string;

  @ApiProperty()
  result!: CropSeasonDto;
}

export class CreateCropPlantingResponseDto {
  @ApiProperty({ default: HttpStatus.CREATED })
  statusCode!: number;

  @ApiProperty({ default: 'Crop planting created successfully' })
  message!: string;

  @ApiProperty()
  result!: CropPlantingDto;
}

export class GetCropPlantingResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Crop planting retrieved successfully' })
  message!: string;

  @ApiProperty()
  result!: CropPlantingDto;
}

export class UpdateCropPlantingResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Crop planting updated successfully' })
  message!: string;

  @ApiProperty()
  result!: CropPlantingDto;
}

export class DeleteCropPlantingResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Crop planting deleted successfully' })
  message!: string;

  @ApiProperty({ nullable: true })
  result!: null;
}

export class FetchCropPlantingsResponseDto {
  @ApiProperty({ type: [CropPlantingDto] })
  results!: CropPlantingDto[];

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

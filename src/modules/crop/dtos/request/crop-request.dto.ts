import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCropBodyDto {
  @ApiPropertyOptional({ example: 'Manga' })
  name?: string;

  @ApiPropertyOptional({ example: 'uuid' })
  defaultProductionUomId?: string;

  @ApiPropertyOptional({ example: 'ERP-001' })
  externalRef?: string | null;
}

export class UpdateCropParamDto {
  @ApiPropertyOptional({ example: 'uuid' })
  id!: string;
}

export class GetCropParamDto {
  @ApiPropertyOptional({ example: 'uuid' })
  id!: string;
}

export class DeleteCropParamDto {
  @ApiPropertyOptional({ example: 'uuid' })
  id!: string;
}

export class FetchCropsQueryDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  perPage?: number;

  @ApiPropertyOptional()
  orderBy?: string;

  @ApiPropertyOptional()
  orderDirection?: string;
}

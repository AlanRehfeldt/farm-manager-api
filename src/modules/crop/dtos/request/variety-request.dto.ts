import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVarietyBodyDto {
  @ApiPropertyOptional({ example: 'Tommy Atkins' })
  name?: string;

  @ApiPropertyOptional({ example: 'ERP-001' })
  externalRef?: string | null;
}

export class UpdateVarietyParamDto {
  @ApiPropertyOptional({ example: 'uuid' })
  id!: string;
}

export class GetVarietyParamDto {
  @ApiPropertyOptional({ example: 'uuid' })
  id!: string;
}

export class DeleteVarietyParamDto {
  @ApiPropertyOptional({ example: 'uuid' })
  id!: string;
}

export class FetchVarietiesQueryDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  cropId?: string;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  perPage?: number;

  @ApiPropertyOptional()
  orderBy?: string;

  @ApiPropertyOptional()
  orderDirection?: string;
}

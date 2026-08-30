import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFieldBodyDto {
  @ApiPropertyOptional({ example: 'T12' })
  name?: string;

  @ApiPropertyOptional({ example: '85.5' })
  areaHa?: string | number;

  @ApiPropertyOptional({ example: true })
  active?: boolean;

  @ApiPropertyOptional({ example: '400' })
  plantsPerHa?: string | number | null;

  @ApiPropertyOptional({ example: 2018 })
  plantedYear?: number | null;

  @ApiPropertyOptional({ example: '10m x 10m' })
  spacingNote?: string | null;

  @ApiPropertyOptional({ example: 'ERP-001' })
  externalRef?: string | null;
}

export class UpdateFieldParamDto {
  @ApiPropertyOptional({ example: 'uuid' })
  id!: string;
}

export class GetFieldParamDto {
  @ApiPropertyOptional({ example: 'uuid' })
  id!: string;
}

export class DeleteFieldParamDto {
  @ApiPropertyOptional({ example: 'uuid' })
  id!: string;
}

export class FetchFieldsQueryDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  active?: boolean;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  perPage?: number;

  @ApiPropertyOptional()
  orderBy?: string;

  @ApiPropertyOptional()
  orderDirection?: string;
}

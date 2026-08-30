import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFieldBodyDto {
  @ApiProperty({ example: 'T12' })
  name!: string;

  @ApiProperty({ example: '85.5' })
  areaHa!: string | number;

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

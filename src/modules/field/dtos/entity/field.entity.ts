import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FieldDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'uuid' })
  farmId!: string;

  @ApiProperty({ example: 'T12' })
  name!: string;

  @ApiProperty({ example: '85.500000', description: 'Area in hectares' })
  areaHa!: string;

  @ApiProperty({ example: true })
  active!: boolean;

  @ApiPropertyOptional({ example: '400.000000' })
  plantsPerHa!: string | null;

  @ApiPropertyOptional({ example: 2018 })
  plantedYear!: number | null;

  @ApiPropertyOptional({ example: '10m x 10m' })
  spacingNote!: string | null;

  @ApiPropertyOptional({ example: 'ERP-001' })
  externalRef!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

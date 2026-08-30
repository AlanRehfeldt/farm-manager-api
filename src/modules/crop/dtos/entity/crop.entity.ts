import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CropDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'uuid' })
  organizationId!: string;

  @ApiProperty({ example: 'Manga' })
  name!: string;

  @ApiPropertyOptional({ example: 'uuid' })
  defaultProductionUomId!: string | null;

  @ApiPropertyOptional({ example: 'ERP-001' })
  externalRef!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

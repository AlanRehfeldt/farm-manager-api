import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCropBodyDto {
  @ApiProperty({ example: 'Manga' })
  name!: string;

  @ApiPropertyOptional({ example: 'uuid' })
  defaultProductionUomId: string;

  @ApiPropertyOptional({ example: 'ERP-001' })
  externalRef?: string | null;
}

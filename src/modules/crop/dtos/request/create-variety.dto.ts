import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVarietyBodyDto {
  @ApiProperty({ example: 'uuid' })
  cropId!: string;

  @ApiProperty({ example: 'Tommy Atkins' })
  name!: string;

  @ApiPropertyOptional({ example: 'ERP-001' })
  externalRef?: string | null;
}

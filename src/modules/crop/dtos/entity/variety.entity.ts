import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VarietyDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'uuid' })
  cropId!: string;

  @ApiProperty({ example: 'Tommy Atkins' })
  name!: string;

  @ApiPropertyOptional({ example: 'ERP-001' })
  externalRef!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

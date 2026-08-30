import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CostCategoryDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'uuid' })
  organizationId!: string;

  @ApiProperty({ example: 'fertilizante' })
  code!: string;

  @ApiProperty({ example: 'Fertilizante' })
  name!: string;

  @ApiPropertyOptional({ example: 'uuid' })
  parentId?: string | null;

  @ApiPropertyOptional({ example: 'uuid' })
  accountPlanId?: string | null;

  @ApiPropertyOptional({ example: 'EXT-001' })
  externalRef?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  constructor(partial: Partial<CostCategoryDto>) {
    Object.assign(this, partial);
  }
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductParamDto {
  @ApiProperty({
    description: "Product's unique identifier",
  })
  id!: string;
}

export class UpdateProductBodyDto {
  @ApiPropertyOptional({
    description: "Product's name",
  })
  name!: string;

  @ApiPropertyOptional({
    description: "Product's description",
  })
  description!: string;

  @ApiPropertyOptional({
    description: "Unit of measurement's unique identifier",
  })
  unitOfMeasurementId!: string;

  @ApiPropertyOptional({
    description: 'Input cost category identifier',
  })
  costCategoryId!: string;
}

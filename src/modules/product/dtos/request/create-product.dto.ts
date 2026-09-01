import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductBodyDto {
  @ApiProperty({
    example: 'John Doe',
    description: "Product's name",
  })
  name!: string;

  @ApiProperty({
    example: '123456',
    description: "Product's description",
  })
  description!: string;

  @ApiProperty({
    example: 'uuid',
    description: "Unit of measurement's unique identifier",
  })
  unitOfMeasurementId!: string;

  @ApiProperty({
    example: 'uuid',
    description: 'Input cost category (natureza do insumo)',
  })
  costCategoryId!: string;

  @ApiPropertyOptional({
    example: 'uuid',
    nullable: true,
    description:
      'Restrict visibility to this farm; omit for all farms in the organization',
  })
  farmId?: string | null;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty({
    example: 'uuid',
    description: "Product's unique identifier",
  })
  id!: string;

  @ApiProperty({
    example: 'uuid',
    description: "Product's organization identifier",
  })
  organizationId!: string;

  @ApiPropertyOptional({
    example: 'uuid',
    nullable: true,
    description: 'When set, product is visible only on this farm',
  })
  farmId?: string | null;

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
    example: '2023-01-01T00:00:00.000Z',
    description: "Product's creation date",
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: "Product's update date",
  })
  updatedAt!: Date;

  constructor(partial: Partial<ProductDto>) {
    Object.assign(this, partial);
  }
}

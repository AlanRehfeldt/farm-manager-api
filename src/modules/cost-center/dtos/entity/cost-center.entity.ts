import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CostCenterDto {
  @ApiProperty({
    example: 'uuid',
    description: "Cost center's unique identifier",
  })
  id!: string;

  @ApiProperty({
    example: 'Research & Development',
    description: "Cost center's name",
  })
  name!: string;

  @ApiProperty({
    example:
      'Focuses on innovation, product development, and technological advancements',
    description: "Cost center's description",
  })
  description!: string;

  @ApiProperty({
    example: '01.02.001',
    description: "Cost center's code",
  })
  code!: string;

  @ApiPropertyOptional({
    example: 'uuid',
    description: "Cost center's parent's unique identifier (if applicable)",
  })
  parentId!: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: "Cost center's creation date",
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: "Cost center's update date",
  })
  updatedAt!: Date;

  constructor(partial: Partial<CostCenterDto>) {
    Object.assign(this, partial);
  }
}

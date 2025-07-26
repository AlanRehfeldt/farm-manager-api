import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCostCenterBodyDto {
  @ApiProperty({
    example: 'Research & Development',
    description: "Cost center's name",
  })
  name: string;

  @ApiProperty({
    example:
      'Focuses on innovation, product development, and technological advancements',
    description: "Cost center's description",
  })
  description: string;

  @ApiProperty({
    example: '01.02.001',
    description: "Cost center's code",
  })
  code: string;

  @ApiPropertyOptional({
    example: 'uuid',
    description: "Cost center's parent's unique identifier (if applicable)",
  })
  parentId: string;
}

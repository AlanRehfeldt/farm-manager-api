import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCostCenterParamDto {
  @ApiProperty({
    description: "Cost center's unique identifier",
  })
  id!: string;
}

export class UpdateCostCenterBodyDto {
  @ApiPropertyOptional({
    description: "Cost center's name",
  })
  name!: string;

  @ApiPropertyOptional({
    description: "Cost center's description",
  })
  description!: string;

  @ApiPropertyOptional({
    description: "Cost center's code",
  })
  code!: string;

  @ApiPropertyOptional({
    description: "Cost center's parent id",
  })
  parentId!: string;
}

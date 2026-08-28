import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAccountPlanParamDto {
  @ApiProperty({
    description: "Account plan's unique identifier",
  })
  id!: string;
}

export class UpdateAccountPlanBodyDto {
  @ApiPropertyOptional({
    description: "Account plan's name",
  })
  name!: string;

  @ApiPropertyOptional({
    description: "Account plan's description",
  })
  description!: string;

  @ApiPropertyOptional({
    description: "Account plan's code",
  })
  code!: string;

  @ApiPropertyOptional({
    description: "Account plan's parent id",
  })
  parentId!: string;
}

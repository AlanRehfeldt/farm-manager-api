import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAccountPlanBodyDto {
  @ApiProperty({
    example: 'Bank XPTO C/c 0000-0',
    description: "Account plan's name",
  })
  name!: string;

  @ApiProperty({
    example: 'Bank XPTO account number 0000-0',
    description: "Account plan's description",
  })
  description!: string;

  @ApiProperty({
    example: '01.02.001',
    description: "Account plan's code",
  })
  code!: string;

  @ApiPropertyOptional({
    example: 'uuid',
    description: "Account plan's parent's unique identifier (if applicable)",
  })
  parentId!: string;
}

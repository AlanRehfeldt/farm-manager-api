import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AccountPlanDto {
  @ApiProperty({
    example: 'uuid',
    description: "Account plan's unique identifier",
  })
  id!: string;

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

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: "Account plan's creation date",
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: "Account plan's update date",
  })
  updatedAt!: Date;

  constructor(partial: Partial<AccountPlanDto>) {
    Object.assign(this, partial);
  }
}

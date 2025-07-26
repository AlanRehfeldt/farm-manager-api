import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';

export class AccountPlanDto {
  @ApiProperty({
    example: 'uuid',
    description: "Account plan's unique identifier",
  })
  id: string;

  @ApiProperty({
    example: 'Bank XPTO C/c 0000-0',
    description: "Account plan's name",
  })
  name: string;

  @ApiProperty({
    example: 'XPTO0000-0',
    description: "Account plan's code",
  })
  code: string;

  @ApiProperty({
    example: AccountType.EXPENSE,
    description: "Account plan's type",
  })
  type: AccountType;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: "Account plan's creation date",
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: "Account plan's update date",
  })
  updatedAt: Date;

  constructor(partial: Partial<AccountPlanDto>) {
    Object.assign(this, partial);
  }
}

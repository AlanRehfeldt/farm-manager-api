import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';

export class CreateAccountPlanBodyDto {
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
}

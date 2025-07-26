import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';

export class UpdateAccountPlanParamDto {
  @ApiProperty({
    description: "Account plan's unique identifier",
  })
  id: string;
}

export class UpdateAccountPlanBodyDto {
  @ApiPropertyOptional({
    description: "Account plan's name",
  })
  name: string;

  @ApiPropertyOptional({
    description: "Account plan's code",
  })
  code: string;

  @ApiPropertyOptional({
    description: "Account plan's type",
  })
  type: AccountType;
}

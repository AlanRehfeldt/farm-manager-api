import { ApiProperty } from '@nestjs/swagger';

export class GetAccountPlanParamDto {
  @ApiProperty({
    description: "Account plan's unique identifier",
  })
  id: string;
}

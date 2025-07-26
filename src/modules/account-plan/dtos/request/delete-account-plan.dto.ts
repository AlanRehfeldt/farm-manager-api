import { ApiProperty } from '@nestjs/swagger';

export class DeleteAccountPlanParamDto {
  @ApiProperty({
    description: "Account plan's unique identifier",
  })
  id: string;
}

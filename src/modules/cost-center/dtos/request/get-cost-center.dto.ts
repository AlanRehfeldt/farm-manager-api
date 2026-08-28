import { ApiProperty } from '@nestjs/swagger';

export class GetCostCenterParamDto {
  @ApiProperty({
    description: "Cost center's unique identifier",
  })
  id!: string;
}

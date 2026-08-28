import { ApiProperty } from '@nestjs/swagger';

export class DeleteCostCenterParamDto {
  @ApiProperty({
    description: "Cost center's unique identifier",
  })
  id!: string;
}

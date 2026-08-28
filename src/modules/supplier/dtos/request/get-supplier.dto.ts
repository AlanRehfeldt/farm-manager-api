import { ApiProperty } from '@nestjs/swagger';

export class GetSupplierParamDto {
  @ApiProperty({
    description: "Supplier's unique identifier",
  })
  id!: string;
}

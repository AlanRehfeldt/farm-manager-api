import { ApiProperty } from '@nestjs/swagger';

export class DeleteSupplierParamDto {
  @ApiProperty({
    description: "Supplier's unique identifier",
  })
  id!: string;
}

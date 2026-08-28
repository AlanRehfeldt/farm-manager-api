import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSupplierParamDto {
  @ApiProperty({
    description: "Supplier's unique identifier",
  })
  id!: string;
}

export class UpdateSupplierBodyDto {
  @ApiPropertyOptional({
    description: "Supplier's name",
  })
  name!: string;

  @ApiPropertyOptional({
    description: "Supplier's cnpj",
  })
  cnpj!: string;

  @ApiPropertyOptional({
    description: "Supplier's address",
  })
  address!: string;

  @ApiPropertyOptional({
    description: "Supplier's phone number",
  })
  phoneNumber!: string;
}

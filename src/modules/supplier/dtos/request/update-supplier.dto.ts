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
  name?: string;

  @ApiPropertyOptional({
    description: "Supplier's CNPJ (digits only); mutually exclusive with CPF",
    nullable: true,
  })
  cnpj?: string | null;

  @ApiPropertyOptional({
    description: "Supplier's CPF (digits only); mutually exclusive with CNPJ",
    nullable: true,
  })
  cpf?: string | null;

  @ApiPropertyOptional({
    description: "Supplier's address",
    nullable: true,
  })
  address?: string | null;

  @ApiPropertyOptional({
    description: "Supplier's city",
    nullable: true,
  })
  city?: string | null;

  @ApiPropertyOptional({
    description: "Supplier's state (UF)",
    nullable: true,
  })
  state?: string | null;

  @ApiPropertyOptional({
    description: "Supplier's phone number (digits only)",
    nullable: true,
  })
  phoneNumber?: string | null;
}

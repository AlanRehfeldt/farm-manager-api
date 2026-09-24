import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierBodyDto {
  @ApiProperty({
    example: 'John Doe',
    description: "Supplier's name",
  })
  name!: string;

  @ApiPropertyOptional({
    example: '11222333000181',
    description: "Supplier's CNPJ (digits only); mutually exclusive with CPF",
  })
  cnpj?: string;

  @ApiPropertyOptional({
    example: '52998224725',
    description: "Supplier's CPF (digits only); mutually exclusive with CNPJ",
  })
  cpf?: string;

  @ApiPropertyOptional({
    example: 'St. Street, 123',
    description: "Supplier's address",
  })
  address?: string;

  @ApiPropertyOptional({
    example: 'Salvador',
    description: "Supplier's city",
  })
  city?: string;

  @ApiPropertyOptional({
    example: 'BA',
    description: "Supplier's state (UF)",
  })
  state?: string;

  @ApiPropertyOptional({
    example: '71999999999',
    description: "Supplier's phone number (digits only)",
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'uuid',
    nullable: true,
    description:
      'Restrict visibility to this farm; omit for all farms in the organization',
  })
  farmId?: string | null;
}

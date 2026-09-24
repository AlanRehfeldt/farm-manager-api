import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SupplierDto {
  @ApiProperty({
    example: 'uuid',
    description: "Supplier's unique identifier",
  })
  id!: string;

  @ApiProperty({
    example: 'uuid',
    description: "Supplier's organization identifier",
  })
  organizationId!: string;

  @ApiPropertyOptional({
    example: 'uuid',
    nullable: true,
    description: 'When set, supplier is visible only on this farm',
  })
  farmId?: string | null;

  @ApiProperty({
    example: 'John Doe',
    description: "Supplier's name",
  })
  name!: string;

  @ApiPropertyOptional({
    example: '11222333000181',
    nullable: true,
    description: "Supplier's CNPJ (digits only); mutually exclusive with CPF",
  })
  cnpj?: string | null;

  @ApiPropertyOptional({
    example: '52998224725',
    nullable: true,
    description: "Supplier's CPF (digits only); mutually exclusive with CNPJ",
  })
  cpf?: string | null;

  @ApiPropertyOptional({
    example: 'St. Street, 123',
    nullable: true,
    description: "Supplier's address",
  })
  address?: string | null;

  @ApiPropertyOptional({
    example: 'Salvador',
    nullable: true,
    description: "Supplier's city",
  })
  city?: string | null;

  @ApiPropertyOptional({
    example: 'BA',
    nullable: true,
    description: "Supplier's state (UF)",
  })
  state?: string | null;

  @ApiPropertyOptional({
    example: '71999999999',
    nullable: true,
    description: "Supplier's phone number (digits only)",
  })
  phoneNumber?: string | null;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: "Supplier's creation date",
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: "Supplier's update date",
  })
  updatedAt!: Date;

  constructor(partial: Partial<SupplierDto>) {
    Object.assign(this, partial);
  }
}

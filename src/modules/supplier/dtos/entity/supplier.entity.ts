import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SupplierDto {
  @ApiProperty({
    example: 'uuid',
    description: "Supplier's unique identifier",
  })
  id: string;

  @ApiProperty({
    example: 'John Doe',
    description: "Supplier's name",
  })
  name: string;

  @ApiProperty({
    example: '99.999.999/9999-99',
    description: "Supplier's cnpj",
  })
  cnpj: string;

  @ApiPropertyOptional({
    example: 'St. Street, 123',
    description: "Supplier's address",
  })
  address: string;

  @ApiPropertyOptional({
    example: '(00) 0 0000-0000',
    description: "Supplier's phone number",
  })
  phoneNumber: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: "Supplier's creation date",
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: "Supplier's update date",
  })
  updatedAt: Date;

  constructor(partial: Partial<SupplierDto>) {
    Object.assign(this, partial);
  }
}

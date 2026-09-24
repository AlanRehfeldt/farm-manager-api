import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrganizationDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Rehfeldt Agro' })
  name!: string;

  @ApiPropertyOptional({ example: '11222333000181', nullable: true })
  cnpj?: string | null;

  @ApiPropertyOptional({ example: '71999999999', nullable: true })
  phone?: string | null;

  @ApiPropertyOptional({ example: 'contato@rehfeldt.agro', nullable: true })
  email?: string | null;

  @ApiPropertyOptional({ example: 'Rua das Flores', nullable: true })
  street?: string | null;

  @ApiPropertyOptional({ example: '100', nullable: true })
  number?: string | null;

  @ApiPropertyOptional({ example: 'Sala 2', nullable: true })
  complement?: string | null;

  @ApiPropertyOptional({ example: 'Salvador', nullable: true })
  city?: string | null;

  @ApiPropertyOptional({ example: 'BA', nullable: true })
  state?: string | null;

  @ApiPropertyOptional({ example: '40000000', nullable: true })
  zipCode?: string | null;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt!: Date;

  constructor(partial: Partial<OrganizationDto>) {
    Object.assign(this, partial);
  }
}

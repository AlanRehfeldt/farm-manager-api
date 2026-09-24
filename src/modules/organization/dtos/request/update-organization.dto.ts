import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrganizationParamDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;
}

export class UpdateOrganizationBodyDto {
  @ApiPropertyOptional({ example: 'Rehfeldt Agro' })
  name?: string;

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
}

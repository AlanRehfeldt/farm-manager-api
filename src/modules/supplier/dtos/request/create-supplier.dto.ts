import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierBodyDto {
  @ApiProperty({
    example: 'John Doe',
    description: "Supplier's name",
  })
  name!: string;

  @ApiProperty({
    example: '99.999.999/9999-99',
    description: "Supplier's cnpj",
  })
  cnpj!: string;

  @ApiPropertyOptional({
    example: 'St. Street, 123',
    description: "Supplier's address",
  })
  address!: string;

  @ApiPropertyOptional({
    example: '(00) 0 0000-0000',
    description: "Supplier's phone number",
  })
  phoneNumber!: string;

  @ApiPropertyOptional({
    example: 'uuid',
    nullable: true,
    description:
      'Restrict visibility to this farm; omit for all farms in the organization',
  })
  farmId?: string | null;
}

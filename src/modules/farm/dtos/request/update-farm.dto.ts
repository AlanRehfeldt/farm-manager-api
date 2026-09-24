import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFarmParamDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;
}

export class UpdateFarmBodyDto {
  @ApiPropertyOptional({ example: 'Sede' })
  name?: string;

  @ApiPropertyOptional({ example: 'America/Bahia' })
  timezone?: string | null;

  @ApiPropertyOptional({ example: 'Estrada Vicinal', nullable: true })
  street?: string | null;

  @ApiPropertyOptional({ example: 's/n', nullable: true })
  number?: string | null;

  @ApiPropertyOptional({ example: 'Km 12', nullable: true })
  complement?: string | null;

  @ApiPropertyOptional({ example: 'Feira de Santana', nullable: true })
  city?: string | null;

  @ApiPropertyOptional({ example: 'BA', nullable: true })
  state?: string | null;

  @ApiPropertyOptional({ example: 'BR', nullable: true })
  country?: string | null;

  @ApiPropertyOptional({ example: '44000000', nullable: true })
  zipCode?: string | null;
}

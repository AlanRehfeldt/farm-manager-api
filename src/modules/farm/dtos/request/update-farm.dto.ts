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
}

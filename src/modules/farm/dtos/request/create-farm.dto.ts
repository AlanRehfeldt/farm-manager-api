import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFarmBodyDto {
  @ApiProperty({ example: 'uuid' })
  organizationId!: string;

  @ApiProperty({ example: 'Sede' })
  name!: string;

  @ApiPropertyOptional({ example: 'America/Bahia' })
  timezone?: string;
}

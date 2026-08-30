import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOnboardingBodyDto {
  @ApiProperty({ example: 'Rehfeldt Agro' })
  organizationName!: string;

  @ApiProperty({ example: 'Sede' })
  farmName!: string;

  @ApiPropertyOptional({ example: 'America/Bahia' })
  timezone?: string;
}

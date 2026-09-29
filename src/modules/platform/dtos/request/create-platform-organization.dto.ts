import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlatformOrganizationAdminDto {
  @ApiProperty({ example: 'Cliente Admin' })
  name!: string;

  @ApiProperty({ example: 'admin@example.com' })
  email!: string;

  @ApiProperty({ example: 'Admin1!x' })
  password!: string;
}

export class CreatePlatformOrganizationBodyDto {
  @ApiProperty({ example: 'Rehfeldt Agro' })
  organizationName!: string;

  @ApiProperty({ example: 'Sede' })
  farmName!: string;

  @ApiPropertyOptional({ example: 'America/Bahia' })
  timezone?: string;

  @ApiProperty({ type: CreatePlatformOrganizationAdminDto })
  admin!: CreatePlatformOrganizationAdminDto;
}

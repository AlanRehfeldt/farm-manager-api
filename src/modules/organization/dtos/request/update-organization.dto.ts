import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrganizationParamDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;
}

export class UpdateOrganizationBodyDto {
  @ApiPropertyOptional({ example: 'Rehfeldt Agro' })
  name?: string;
}

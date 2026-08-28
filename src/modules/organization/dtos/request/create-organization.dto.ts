import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationBodyDto {
  @ApiProperty({ example: 'Rehfeldt Agro' })
  name!: string;
}

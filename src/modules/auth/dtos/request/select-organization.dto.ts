import { ApiProperty } from '@nestjs/swagger';

export class SelectOrganizationBodyDto {
  @ApiProperty({ example: 'uuid' })
  organizationId!: string;
}

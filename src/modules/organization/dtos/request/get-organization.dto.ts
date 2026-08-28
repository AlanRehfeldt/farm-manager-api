import { ApiProperty } from '@nestjs/swagger';

export class GetOrganizationParamDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;
}

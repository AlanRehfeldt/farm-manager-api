import { ApiProperty } from '@nestjs/swagger';

export class DeleteOrgUserQueryDto {
  @ApiProperty({ example: 'uuid' })
  organizationId!: string;
}

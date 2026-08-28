import { ApiProperty } from '@nestjs/swagger';

export class DeleteMembershipParamDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;
}

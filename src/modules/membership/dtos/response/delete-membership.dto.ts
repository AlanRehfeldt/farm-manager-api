import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteMembershipResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Membership deleted successfully' })
  message!: string;

  @ApiProperty({ default: null, nullable: true, type: 'null' })
  result!: null;
}

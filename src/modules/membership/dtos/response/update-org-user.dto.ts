import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { MembershipDto } from '../entity/membership.entity';

export class UpdateOrgUserResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'User updated successfully' })
  message!: string;

  @ApiProperty({ type: [MembershipDto] })
  result!: MembershipDto[];
}

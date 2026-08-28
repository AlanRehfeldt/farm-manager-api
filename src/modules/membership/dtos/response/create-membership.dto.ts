import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { MembershipDto } from '../entity/membership.entity';

export class CreateMembershipResponseDto {
  @ApiProperty({ default: HttpStatus.CREATED })
  statusCode!: number;

  @ApiProperty({ default: 'Membership created successfully' })
  message!: string;

  @ApiProperty({ type: MembershipDto })
  result!: MembershipDto;
}

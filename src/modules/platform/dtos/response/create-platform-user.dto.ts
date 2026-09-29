import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { MembershipDto } from 'src/modules/membership/dtos/entity/membership.entity';
import { PlatformAdminSummaryDto } from '../entity/platform-admin-summary.entity';

export class CreatePlatformUserResultDto {
  @ApiProperty({ type: PlatformAdminSummaryDto })
  user!: PlatformAdminSummaryDto;

  @ApiProperty({ type: [MembershipDto] })
  memberships!: MembershipDto[];
}

export class CreatePlatformUserResponseDto {
  @ApiProperty({ default: HttpStatus.CREATED })
  statusCode!: number;

  @ApiProperty({ default: 'User created successfully' })
  message!: string;

  @ApiProperty({ type: CreatePlatformUserResultDto })
  result!: CreatePlatformUserResultDto;
}

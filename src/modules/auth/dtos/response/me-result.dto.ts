import { ApiProperty } from '@nestjs/swagger';
import { MembershipDto } from 'src/modules/membership/dtos/entity/membership.entity';
import { UserDto } from 'src/modules/user/dtos/entity/user.entity';

export class SupportAccessSummaryDto {
  @ApiProperty()
  organizationId!: string;

  @ApiProperty()
  organizationName!: string;
}

export class MeResultDto extends UserDto {
  @ApiProperty({ type: [MembershipDto] })
  memberships!: MembershipDto[];

  @ApiProperty({ type: [SupportAccessSummaryDto] })
  supportAccesses!: SupportAccessSummaryDto[];

  constructor(partial: Partial<MeResultDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}

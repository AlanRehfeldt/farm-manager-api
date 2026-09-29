import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationSelection } from '@prisma/client';
import { MembershipDto } from 'src/modules/membership/dtos/entity/membership.entity';
import { UserDto } from 'src/modules/user/dtos/entity/user.entity';

export class SupportAccessSummaryDto {
  @ApiProperty()
  organizationId!: string;

  @ApiProperty()
  organizationName!: string;
}

export class OrganizationOptionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

export class MeResultDto extends UserDto {
  @ApiProperty({ type: [MembershipDto] })
  memberships!: MembershipDto[];

  @ApiProperty({ type: [SupportAccessSummaryDto] })
  supportAccesses!: SupportAccessSummaryDto[];

  @ApiProperty({ enum: OrganizationSelection })
  organizationSelection!: OrganizationSelection;

  @ApiPropertyOptional({ nullable: true })
  organizationId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  organizationName!: string | null;

  @ApiProperty({ type: [OrganizationOptionDto] })
  organizations!: OrganizationOptionDto[];

  constructor(partial: Partial<MeResultDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}

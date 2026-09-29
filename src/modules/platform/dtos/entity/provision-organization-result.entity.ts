import { ApiProperty } from '@nestjs/swagger';
import { FarmDto } from 'src/modules/farm/dtos/entity/farm.entity';
import { OrganizationDto } from 'src/modules/organization/dtos/entity/organization.entity';
import { PlatformAdminSummaryDto } from './platform-admin-summary.entity';

export class ProvisionOrganizationResultDto {
  @ApiProperty({ type: OrganizationDto })
  organization!: OrganizationDto;

  @ApiProperty({ type: FarmDto })
  farm!: FarmDto;

  @ApiProperty({ type: PlatformAdminSummaryDto })
  admin!: PlatformAdminSummaryDto;
}

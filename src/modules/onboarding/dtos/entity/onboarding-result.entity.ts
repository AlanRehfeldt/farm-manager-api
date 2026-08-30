import { ApiProperty } from '@nestjs/swagger';
import { OrganizationDto } from 'src/modules/organization/dtos/entity/organization.entity';
import { FarmDto } from 'src/modules/farm/dtos/entity/farm.entity';

export class OnboardingResultDto {
  @ApiProperty({ type: OrganizationDto })
  organization!: OrganizationDto;

  @ApiProperty({ type: FarmDto })
  farm!: FarmDto;

  constructor(partial: Partial<OnboardingResultDto>) {
    Object.assign(this, partial);
  }
}

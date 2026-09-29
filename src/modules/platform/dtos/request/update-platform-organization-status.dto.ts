import { ApiProperty } from '@nestjs/swagger';
import { OrganizationStatus } from '@prisma/client';

export class UpdatePlatformOrganizationStatusParamDto {
  @ApiProperty({ example: 'uuid' })
  organizationId!: string;
}

export class UpdatePlatformOrganizationStatusBodyDto {
  @ApiProperty({
    enum: OrganizationStatus,
    example: OrganizationStatus.SUSPENDED,
  })
  status!: OrganizationStatus;
}

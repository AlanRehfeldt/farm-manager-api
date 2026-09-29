import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { OrganizationStatus } from '@prisma/client';

export class UpdatePlatformOrganizationStatusResultDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Rehfeldt Agro' })
  name!: string;

  @ApiProperty({
    enum: OrganizationStatus,
    example: OrganizationStatus.SUSPENDED,
  })
  status!: OrganizationStatus;
}

export class UpdatePlatformOrganizationStatusResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Organization status updated successfully' })
  message!: string;

  @ApiProperty({ type: UpdatePlatformOrganizationStatusResultDto })
  result!: UpdatePlatformOrganizationStatusResultDto;
}

import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import type { Organization } from '@prisma/client';

export class UpdatePlatformOrganizationResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Organization updated successfully' })
  message!: string;

  @ApiProperty()
  result!: Organization;
}

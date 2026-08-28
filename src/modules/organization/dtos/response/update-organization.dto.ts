import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { OrganizationDto } from '../entity/organization.entity';

export class UpdateOrganizationResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Organization updated successfully' })
  message!: string;

  @ApiProperty({ type: OrganizationDto })
  result!: OrganizationDto;
}

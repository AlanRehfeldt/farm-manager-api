import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { OrganizationDto } from '../entity/organization.entity';

export class GetOrganizationResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Organization retrieved successfully' })
  message!: string;

  @ApiProperty({ type: OrganizationDto })
  result!: OrganizationDto;
}

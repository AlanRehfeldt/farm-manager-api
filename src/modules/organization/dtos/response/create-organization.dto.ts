import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { OrganizationDto } from '../entity/organization.entity';

export class CreateOrganizationResponseDto {
  @ApiProperty({ default: HttpStatus.CREATED })
  statusCode!: number;

  @ApiProperty({ default: 'Organization created successfully' })
  message!: string;

  @ApiProperty({ type: OrganizationDto })
  result!: OrganizationDto;
}

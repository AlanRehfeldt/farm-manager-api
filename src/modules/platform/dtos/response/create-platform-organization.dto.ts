import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ProvisionOrganizationResultDto } from '../entity/provision-organization-result.entity';

export class CreatePlatformOrganizationResponseDto {
  @ApiProperty({ default: HttpStatus.CREATED })
  statusCode!: number;

  @ApiProperty({ default: 'Organization provisioned successfully' })
  message!: string;

  @ApiProperty({ type: ProvisionOrganizationResultDto })
  result!: ProvisionOrganizationResultDto;
}

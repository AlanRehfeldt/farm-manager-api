import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class RemovePlatformOrganizationUserResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'User removed from organization' })
  message!: string;

  @ApiProperty({ nullable: true, type: 'null' })
  result!: null;
}

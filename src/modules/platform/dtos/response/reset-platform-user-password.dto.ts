import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPlatformUserPasswordResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Password reset successfully' })
  message!: string;

  @ApiProperty({ default: null, nullable: true, type: 'null' })
  result!: null;
}

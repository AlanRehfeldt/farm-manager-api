import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { MeResultDto } from './me-result.dto';

export class MeResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'User retrieved successfully' })
  message!: string;

  @ApiProperty({ type: MeResultDto })
  result!: MeResultDto;
}

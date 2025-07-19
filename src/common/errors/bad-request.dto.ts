import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class BadRequestDto {
  @ApiProperty({
    default: 'Invalid data provided',
  })
  message: string;

  @ApiProperty({
    default: 'Bad Request',
  })
  error: string;

  @ApiProperty({
    default: HttpStatus.BAD_REQUEST,
  })
  statusCode: number;
}

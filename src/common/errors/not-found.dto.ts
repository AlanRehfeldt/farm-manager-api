import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class NotFoundDto {
  @ApiProperty({
    default: HttpStatus.NOT_FOUND,
  })
  statusCode!: number;

  @ApiProperty({
    default: 'Resource not found',
  })
  message!: string;

  @ApiProperty({
    default: 'Not Found',
  })
  error!: string;
}

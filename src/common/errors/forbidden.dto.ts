import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class ForbiddenDto {
  @ApiProperty({
    default: 'Resorce not allowed',
  })
  message: string;

  @ApiProperty({
    default: 'Forbidden',
  })
  error: string;

  @ApiProperty({
    default: HttpStatus.FORBIDDEN,
  })
  statusCode: number;
}

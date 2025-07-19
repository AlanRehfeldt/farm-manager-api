import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class ConflictDto {
  @ApiProperty({
    default: 'Conflictuos data provided',
  })
  message: string;

  @ApiProperty({
    default: 'Conflict',
  })
  error: string;

  @ApiProperty({
    default: HttpStatus.CONFLICT,
  })
  statusCode: number;
}

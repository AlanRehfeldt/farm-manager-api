import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

class BadRequestError {
  @ApiProperty({
    default: 'Field name',
  })
  field!: string;

  @ApiProperty({
    default: 'Field error message',
  })
  message!: string;
}

export class BadRequestDto {
  @ApiProperty({
    default: HttpStatus.BAD_REQUEST,
  })
  statusCode!: number;

  @ApiProperty({
    default: 'Invalid data provided',
  })
  message!: string;

  @ApiProperty({
    type: [BadRequestError],
  })
  errors!: BadRequestError[];
}

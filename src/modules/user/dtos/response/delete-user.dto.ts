import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserResponseDto {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode: string;

  @ApiProperty({
    default: 'User updated successfully',
  })
  message: string;

  @ApiProperty({ default: null, nullable: true, type: 'null' })
  result: null;
}

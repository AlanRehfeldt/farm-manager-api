import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../entity/user.entity';

export class UpdateUserResponseDto {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode!: string;

  @ApiProperty({
    default: 'User updated successfully',
  })
  message!: string;

  @ApiProperty()
  result!: UserDto;
}

import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { UserDto } from '../entity/user.entity';

export class CreateUserResponseDto {
  @ApiProperty({
    default: HttpStatus.CREATED,
  })
  statusCode!: string;

  @ApiProperty({
    default: 'User created successfully',
  })
  message!: string;

  @ApiProperty()
  result!: UserDto;
}

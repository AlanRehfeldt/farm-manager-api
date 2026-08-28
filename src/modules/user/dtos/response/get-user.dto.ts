import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../entity/user.entity';

export class GetUserResponseDto {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode!: string;

  @ApiProperty({
    default: 'User retrived successfully',
  })
  message!: string;

  @ApiProperty()
  result!: UserDto;
}

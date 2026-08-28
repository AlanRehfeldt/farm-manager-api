import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from 'src/modules/user/dtos/entity/user.entity';

export class LoginResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Logged in successfully' })
  message!: string;

  @ApiProperty({ type: UserDto })
  result!: UserDto;
}

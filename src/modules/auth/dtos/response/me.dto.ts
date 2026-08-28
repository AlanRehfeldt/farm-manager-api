import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from 'src/modules/user/dtos/entity/user.entity';

export class MeResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'User retrieved successfully' })
  message!: string;

  @ApiProperty({ type: UserDto })
  result!: UserDto;
}

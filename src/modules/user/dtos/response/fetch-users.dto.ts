import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../entity/user.entity';

export class FetchUsersResponseDto {
  @ApiProperty({
    type: [UserDto],
  })
  results: UserDto[];

  @ApiProperty()
  total: number;

  @ApiProperty({
    default: 1,
  })
  page: number;

  @ApiProperty({
    default: 10,
  })
  perPage: number;

  @ApiProperty({
    default: 'name',
  })
  orderBy: number;

  @ApiProperty({
    default: 'asc',
  })
  orderDirection: number;
}

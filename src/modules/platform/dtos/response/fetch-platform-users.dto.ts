import { ApiProperty } from '@nestjs/swagger';
import { PlatformUserDto } from '../entity/platform-user.entity';

export class FetchPlatformUsersResponseDto {
  @ApiProperty({ type: [PlatformUserDto] })
  results!: PlatformUserDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty({ default: 1 })
  page!: number;

  @ApiProperty({ default: 10 })
  perPage!: number;

  @ApiProperty({ default: 'name' })
  orderBy!: string;

  @ApiProperty({ default: 'asc' })
  orderDirection!: string;
}

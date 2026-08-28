import { ApiProperty } from '@nestjs/swagger';
import { MembershipDto } from '../entity/membership.entity';

export class FetchMembershipsResponseDto {
  @ApiProperty({ type: [MembershipDto] })
  results!: MembershipDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty({ default: 1 })
  page!: number;

  @ApiProperty({ default: 10 })
  perPage!: number;

  @ApiProperty({ default: 'createdAt' })
  orderBy!: string;

  @ApiProperty({ default: 'desc' })
  orderDirection!: string;
}

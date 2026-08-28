import { ApiProperty } from '@nestjs/swagger';
import { FarmDto } from '../entity/farm.entity';

export class FetchFarmsResponseDto {
  @ApiProperty({ type: [FarmDto] })
  results!: FarmDto[];

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

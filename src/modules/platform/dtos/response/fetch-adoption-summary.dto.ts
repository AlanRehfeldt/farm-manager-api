import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

class AdoptionCountPairDto {
  @ApiProperty()
  active!: number;

  @ApiProperty()
  suspended!: number;
}

class AdoptionUsageCountsDto {
  @ApiProperty()
  active7d!: number;

  @ApiProperty()
  active30d!: number;

  @ApiProperty()
  silent30d!: number;
}

class AdoptionAccessCountsDto {
  @ApiProperty()
  stale30d!: number;
}

class AdoptionWeekCountDto {
  @ApiProperty({ example: '2026-09-28' })
  weekStart!: string;

  @ApiProperty()
  count!: number;
}

class FetchAdoptionSummaryResultDto {
  @ApiProperty({ type: AdoptionCountPairDto })
  organizations!: AdoptionCountPairDto;

  @ApiProperty({ type: AdoptionUsageCountsDto })
  usage!: AdoptionUsageCountsDto;

  @ApiProperty({ type: AdoptionAccessCountsDto })
  access!: AdoptionAccessCountsDto;

  @ApiProperty({ type: [AdoptionWeekCountDto] })
  activitiesByWeek!: AdoptionWeekCountDto[];
}

export class FetchAdoptionSummaryResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Adoption summary retrieved successfully' })
  message!: string;

  @ApiProperty({ type: FetchAdoptionSummaryResultDto })
  result!: FetchAdoptionSummaryResultDto;
}

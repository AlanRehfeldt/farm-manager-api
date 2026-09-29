import { ApiProperty } from '@nestjs/swagger';
import { PlatformOrganizationDto } from '../entity/platform-organization.entity';

export class FetchPlatformOrganizationsResponseDto {
  @ApiProperty({ type: [PlatformOrganizationDto] })
  results!: PlatformOrganizationDto[];

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

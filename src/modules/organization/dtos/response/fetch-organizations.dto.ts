import { ApiProperty } from '@nestjs/swagger';
import { OrganizationDto } from '../entity/organization.entity';

export class FetchOrganizationsResponseDto {
  @ApiProperty({ type: [OrganizationDto] })
  results!: OrganizationDto[];

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

import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationStatus } from '@prisma/client';

class PlatformOrganizationUsageDto {
  @ApiProperty()
  activities!: number;

  @ApiProperty()
  purchases!: number;

  @ApiProperty()
  salaries!: number;

  @ApiProperty()
  genericExpenses!: number;

  @ApiProperty()
  harvests!: number;

  @ApiProperty()
  activeSeasons!: number;

  @ApiProperty()
  seasonCount!: number;
}

class GetPlatformOrganizationResultDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: OrganizationStatus })
  status!: OrganizationStatus;

  @ApiPropertyOptional({ nullable: true })
  city!: string | null;

  @ApiPropertyOptional({ nullable: true })
  state!: string | null;

  @ApiPropertyOptional({ nullable: true })
  cnpj!: string | null;

  @ApiPropertyOptional({ nullable: true })
  phone!: string | null;

  @ApiPropertyOptional({ nullable: true })
  email!: string | null;

  @ApiPropertyOptional({ nullable: true })
  street!: string | null;

  @ApiPropertyOptional({ nullable: true })
  number!: string | null;

  @ApiPropertyOptional({ nullable: true })
  complement!: string | null;

  @ApiPropertyOptional({ nullable: true })
  zipCode!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  lastAccessAt!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  lastActivityAt!: Date | null;

  @ApiProperty()
  farmCount!: number;

  @ApiProperty({ type: PlatformOrganizationUsageDto })
  usage!: PlatformOrganizationUsageDto;
}

export class GetPlatformOrganizationResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Organization retrieved successfully' })
  message!: string;

  @ApiProperty({ type: GetPlatformOrganizationResultDto })
  result!: GetPlatformOrganizationResultDto;
}

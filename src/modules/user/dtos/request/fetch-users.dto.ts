import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class FetchUsersQueryDto {
  @ApiPropertyOptional()
  id!: string;

  @ApiPropertyOptional()
  name!: string;

  @ApiPropertyOptional()
  email!: string;

  @ApiPropertyOptional({
    description:
      'Filter by legacy User.role (not Membership.role). Scheduled for removal with User.role in PR-18.',
    enum: Role,
    deprecated: true,
  })
  role!: Role;

  @ApiPropertyOptional()
  employeeId!: string;

  @ApiPropertyOptional()
  page!: number;

  @ApiPropertyOptional()
  perPage!: number;

  @ApiPropertyOptional()
  orderBy!: string;

  @ApiPropertyOptional()
  orderDirection!: 'asc' | 'desc';
}

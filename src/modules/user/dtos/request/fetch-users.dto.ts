import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class FetchUsersQueryDto {
  @ApiPropertyOptional()
  id!: string;

  @ApiPropertyOptional()
  name!: string;

  @ApiPropertyOptional()
  email!: string;

  @ApiPropertyOptional()
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

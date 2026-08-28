import { ApiPropertyOptional } from '@nestjs/swagger';
import { EmployeeType } from '@prisma/client';

export class FetchEmployeesQueryDto {
  @ApiPropertyOptional()
  id!: string;

  @ApiPropertyOptional()
  name!: string;

  @ApiPropertyOptional()
  registration!: string;

  @ApiPropertyOptional()
  type!: EmployeeType;

  @ApiPropertyOptional()
  page!: number;

  @ApiPropertyOptional()
  perPage!: number;

  @ApiPropertyOptional()
  orderBy!: string;

  @ApiPropertyOptional()
  orderDirection!: 'asc' | 'desc';
}

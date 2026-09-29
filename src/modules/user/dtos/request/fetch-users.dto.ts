import { ApiPropertyOptional } from '@nestjs/swagger';

export class FetchUsersQueryDto {
  @ApiPropertyOptional()
  id!: string;

  @ApiPropertyOptional()
  name!: string;

  @ApiPropertyOptional()
  email!: string;

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

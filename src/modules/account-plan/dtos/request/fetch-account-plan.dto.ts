import { ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';

export class FetchAccountPlansQueryDto {
  @ApiPropertyOptional()
  id: string;

  @ApiPropertyOptional()
  name: string;

  @ApiPropertyOptional()
  code: string;

  @ApiPropertyOptional()
  type: AccountType;

  @ApiPropertyOptional()
  page: number;

  @ApiPropertyOptional()
  perPage: number;

  @ApiPropertyOptional()
  orderBy: string;

  @ApiPropertyOptional()
  orderDirection: 'asc' | 'desc';
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class FetchTransactionsQueryDto {
  @ApiPropertyOptional()
  id!: string;

  @ApiPropertyOptional()
  type!: TransactionType;

  @ApiPropertyOptional()
  dateFrom!: Date;

  @ApiPropertyOptional()
  dateTo!: Date;

  @ApiPropertyOptional()
  page!: number;

  @ApiPropertyOptional()
  perPage!: number;

  @ApiPropertyOptional()
  orderBy!: string;

  @ApiPropertyOptional()
  orderDirection!: 'asc' | 'desc';
}

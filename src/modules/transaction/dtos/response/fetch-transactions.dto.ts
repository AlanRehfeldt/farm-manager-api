import { ApiProperty } from '@nestjs/swagger';
import { TransactionDto } from '../entity/transaction.entity';

export class FetchTransactionsResponseDto {
  @ApiProperty({
    type: [TransactionDto],
  })
  results!: TransactionDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty({
    default: 1,
  })
  page!: number;

  @ApiProperty({
    default: 10,
  })
  perPage!: number;

  @ApiProperty({
    default: 'name',
  })
  orderBy!: number;

  @ApiProperty({
    default: 'asc',
  })
  orderDirection!: number;
}

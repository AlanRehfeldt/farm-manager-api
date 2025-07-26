import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionDto } from '../entity/transaction.entity';

export class GetTransactionResponseDto {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode: string;

  @ApiProperty({
    default: 'Transaction retrived successfully',
  })
  message: string;

  @ApiProperty()
  result: TransactionDto;
}

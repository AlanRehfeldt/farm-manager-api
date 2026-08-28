import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { TransactionDto } from '../entity/transaction.entity';

export class CreateTransactionResponseDto {
  @ApiProperty({
    default: HttpStatus.CREATED,
  })
  statusCode!: string;

  @ApiProperty({
    default: 'Transaction created successfully',
  })
  message!: string;

  @ApiProperty()
  result!: TransactionDto;
}

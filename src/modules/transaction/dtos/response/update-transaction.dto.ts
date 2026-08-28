import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionDto } from '../entity/transaction.entity';

export class UpdateTransactionResponseDto {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode!: string;

  @ApiProperty({
    default: 'Transaction updated successfully',
  })
  message!: string;

  @ApiProperty()
  result!: TransactionDto;
}

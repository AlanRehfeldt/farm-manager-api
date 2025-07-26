import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class UpdateTransactionParamDto {
  @ApiProperty({
    description: "Transaction's unique identifier",
  })
  id: string;
}

export class UpdateTransactionBodyDto {
  @ApiPropertyOptional({
    example: TransactionType.PURCHASE_INPUT,
    description: "Transaction's type",
    enum: TransactionType,
  })
  type: TransactionType;

  @ApiPropertyOptional({
    description: "Transaction's date",
  })
  date: Date;

  @ApiPropertyOptional({
    description: 'Observation of the transaction',
  })
  note: string;
}

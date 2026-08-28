import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class TransactionDto {
  @ApiProperty({
    example: 'uuid',
    description: "Transaction's unique identifier",
  })
  id!: string;

  @ApiProperty({
    example: TransactionType.PURCHASE_INPUT,
    description: "Transaction's type",
    enum: TransactionType,
  })
  type!: TransactionType;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: "Transaction's date",
  })
  date!: Date;

  @ApiPropertyOptional({
    example: 'Observation to the transaction',
    description: "Transaction's note (if applicable).",
  })
  note!: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: "Transaction's creation date",
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: "Transaction's update date",
  })
  updatedAt!: Date;

  constructor(partial: Partial<TransactionDto>) {
    Object.assign(this, partial);
  }
}

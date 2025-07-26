import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentForm } from '@prisma/client';

export class InstallmentDto {
  @ApiProperty({
    example: 'uuid',
    description: "Installment's unique identifier",
  })
  id: string;

  @ApiProperty({
    example: '999',
    description: 'Amount of the installment in cents (e.g., 999 = R$9,99).',
  })
  valueInCents: number;

  @ApiProperty({
    example: '2023-02-15T00:00:00.000Z',
    description: "Installment's due date",
  })
  dueDate: Date;

  @ApiPropertyOptional({
    example: '2023-02-12T00:00:00.000Z',
    description: 'Date on which the installment was paid (if applicable).',
  })
  paymentDate: Date;

  @ApiProperty({
    example: PaymentForm.CASH,
    description: 'Payment method used for the installment.',
    enum: PaymentForm,
  })
  paymentForm: PaymentForm;

  @ApiProperty({
    example: PaymentForm.CASH,
    description: "Transaction's unique identifier",
  })
  transactionId: PaymentForm;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: "Installment's creation date",
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: "Installment's update date",
  })
  updatedAt: Date;

  constructor(partial: Partial<InstallmentDto>) {
    Object.assign(this, partial);
  }
}

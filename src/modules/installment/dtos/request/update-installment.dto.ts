import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentForm } from '@prisma/client';

export class UpdateInstallmentParamDto {
  @ApiProperty({
    description: "Installment's unique identifier",
  })
  id!: string;
}

export class UpdateInstallmentBodyDto {
  @ApiPropertyOptional({
    example: '999',
    description: 'Amount of the installment in cents (e.g., 999 = R$9,99).',
  })
  valueInCents!: number;

  @ApiPropertyOptional({
    example: '2023-02-15T00:00:00.000Z',
    description: "Installment's due date",
  })
  dueDate!: Date;

  @ApiPropertyOptional({
    example: '2023-02-12T00:00:00.000Z',
    description: 'Date on which the installment was paid (if applicable).',
  })
  paymentDate!: Date;

  @ApiPropertyOptional({
    example: PaymentForm.CASH,
    description: 'Payment method used for the installment.',
    enum: PaymentForm,
  })
  paymentForm!: PaymentForm;

  @ApiPropertyOptional({
    example: 'uuid',
    description: "Transaction's unique identifier",
  })
  transactionId!: string;
}

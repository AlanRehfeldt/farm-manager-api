import { ApiProperty } from '@nestjs/swagger';

export class DeleteTransactionParamDto {
  @ApiProperty({
    description: "Transaction's unique identifier",
  })
  id: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class GetTransactionParamDto {
  @ApiProperty({
    description: "Transaction's unique identifier",
  })
  id: string;
}

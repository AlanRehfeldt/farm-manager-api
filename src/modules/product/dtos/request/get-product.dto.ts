import { ApiProperty } from '@nestjs/swagger';

export class GetProductParamDto {
  @ApiProperty({
    description: "Product's unique identifier",
  })
  id!: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class DeleteProductParamDto {
  @ApiProperty({
    description: "Product's unique identifier",
  })
  id: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class GetUserParamDto {
  @ApiProperty({
    description: "User's unique identifier",
  })
  id!: string;
}

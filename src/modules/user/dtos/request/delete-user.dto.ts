import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserParamDto {
  @ApiProperty({
    description: "User's unique identifier",
  })
  id!: string;
}

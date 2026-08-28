import { ApiProperty } from '@nestjs/swagger';

export class LoginBodyDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  email!: string;

  @ApiProperty({ example: 'Password1!' })
  password!: string;
}

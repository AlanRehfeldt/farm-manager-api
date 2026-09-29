import { ApiProperty } from '@nestjs/swagger';

export class ResetPlatformUserPasswordParamDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;
}

export class ResetPlatformUserPasswordBodyDto {
  @ApiProperty({ example: 'Reset1!x' })
  password!: string;
}

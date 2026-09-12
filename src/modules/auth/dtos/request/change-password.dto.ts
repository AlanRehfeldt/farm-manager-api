import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordBodyDto {
  @ApiProperty({ example: 'TempPass1!' })
  currentPassword!: string;

  @ApiProperty({ example: 'NewPass1!' })
  newPassword!: string;
}

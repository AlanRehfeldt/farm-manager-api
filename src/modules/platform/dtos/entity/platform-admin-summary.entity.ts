import { ApiProperty } from '@nestjs/swagger';
import { PlatformRole } from '@prisma/client';

export class PlatformAdminSummaryDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Cliente Admin' })
  name!: string;

  @ApiProperty({ example: 'admin@example.com' })
  email!: string;

  @ApiProperty({ enum: PlatformRole, example: PlatformRole.NONE })
  platformRole!: PlatformRole;

  @ApiProperty({ example: true })
  mustChangePassword!: boolean;

  @ApiProperty({ example: '2026-09-29T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-29T00:00:00.000Z' })
  updatedAt!: Date;
}

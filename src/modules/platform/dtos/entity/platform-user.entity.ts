import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlatformRole, Role } from '@prisma/client';

export class PlatformUserMembershipDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'uuid' })
  organizationId!: string;

  @ApiProperty({ enum: Role, example: Role.ADMIN })
  role!: Role;

  @ApiPropertyOptional({ example: 'uuid', nullable: true })
  farmId!: string | null;
}

export class PlatformUserDto {
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

  @ApiPropertyOptional({ example: 'uuid', nullable: true })
  employeeId!: string | null;

  @ApiProperty({ example: '2026-09-29T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-29T00:00:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ type: [PlatformUserMembershipDto] })
  memberships!: PlatformUserMembershipDto[];
}

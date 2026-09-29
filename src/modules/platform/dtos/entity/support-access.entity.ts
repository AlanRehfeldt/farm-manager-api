import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SupportUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  mustChangePassword!: boolean;

  @ApiProperty()
  createdAt!: Date;
}

export class SupportAccessDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiPropertyOptional()
  userName?: string;

  @ApiPropertyOptional()
  userEmail?: string;

  @ApiProperty()
  organizationId!: string;

  @ApiPropertyOptional()
  organizationName?: string;

  @ApiProperty()
  grantedByUserId!: string;

  @ApiPropertyOptional()
  grantedByName?: string;

  @ApiPropertyOptional()
  revokedAt?: Date | null;

  @ApiProperty()
  createdAt!: Date;
}

export class AuditLogDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  actorUserId!: string;

  @ApiProperty()
  actorName!: string;

  @ApiProperty()
  action!: string;

  @ApiProperty()
  targetType!: string;

  @ApiPropertyOptional()
  targetId!: string | null;

  @ApiPropertyOptional()
  organizationId!: string | null;

  @ApiPropertyOptional()
  organizationName!: string | null;

  @ApiProperty()
  createdAt!: Date;
}

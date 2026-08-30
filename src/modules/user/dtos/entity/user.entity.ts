import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlatformRole, Role } from '@prisma/client';

export class UserDto {
  @ApiProperty({
    example: 'uuid',
    description: "User's unique identifier",
  })
  id!: string;

  @ApiProperty({
    example: 'John Doe',
    description: "User's name",
  })
  name!: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: "User's email address",
  })
  email!: string;

  @ApiProperty({
    example: Role.USER,
    description:
      'Legacy global role on User (not used for authorization). Tenant access uses Membership.role. Scheduled for removal in PR-18.',
    enum: Role,
    deprecated: true,
  })
  role!: Role;

  @ApiProperty({
    example: PlatformRole.NONE,
    description:
      'Platform axis (vendor vs client). Orthogonal to Membership.role. Used by @PlatformAdmin().',
    enum: PlatformRole,
  })
  platformRole!: PlatformRole;

  @ApiPropertyOptional({
    example: 'uuid',
    description: "User's employee unique identifier",
  })
  employeeId!: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: "User's creation date",
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: "User's update date",
  })
  updatedAt!: Date;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}

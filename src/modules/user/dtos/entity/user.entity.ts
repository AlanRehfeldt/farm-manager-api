import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlatformRole } from '@prisma/client';

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
    example: PlatformRole.NONE,
    description:
      'Platform axis (vendor vs client). Orthogonal to Membership.role. Used by @PlatformAdmin().',
    enum: PlatformRole,
  })
  platformRole!: PlatformRole;

  @ApiProperty({
    example: false,
    description:
      'When true, the user must change password before accessing business routes (PR-22).',
  })
  mustChangePassword!: boolean;

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

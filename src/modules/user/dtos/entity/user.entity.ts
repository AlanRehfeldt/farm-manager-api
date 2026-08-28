import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

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
    description: "User's role in system",
    enum: Role,
  })
  role!: Role;

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

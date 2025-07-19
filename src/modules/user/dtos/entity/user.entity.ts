import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserDto {
  @ApiProperty({
    example: 'uuid',
    description: "User's unique identifier",
  })
  id: string;

  @ApiProperty({
    example: 'John Doe',
    description: "User's name",
  })
  name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: "User's email address",
  })
  email: string;

  @ApiProperty({
    example: Role.USER,
    description: "User's role in system",
    enum: Role,
  })
  role: Role;

  @ApiPropertyOptional({
    example: 'uuid',
    description: "User's employee unique identifier",
  })
  employeeId: string;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}

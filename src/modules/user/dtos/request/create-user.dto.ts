import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserBodyDto {
  @ApiProperty({
    example: 'John Doe',
    description: "User's name",
  })
  name!: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: "User's Email address",
  })
  email!: string;

  @ApiProperty({
    example: '$trongP@ssw0rd1',
    description: "User's password",
  })
  password!: string;

  @ApiPropertyOptional({
    example: 'uuid',
    description: "User's employee unique identifier",
  })
  employeeId!: string;
}

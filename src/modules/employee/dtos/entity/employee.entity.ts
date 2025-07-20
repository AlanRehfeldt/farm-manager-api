import { ApiProperty } from '@nestjs/swagger';
import { EmployeeType } from '@prisma/client';

export class EmployeeDto {
  @ApiProperty({
    example: 'uuid',
    description: "Employee's unique identifier",
  })
  id: string;

  @ApiProperty({
    example: 'John Doe',
    description: "Employee's name",
  })
  name: string;

  @ApiProperty({
    example: '123456',
    description: "Employee's registration",
  })
  registration: string;

  @ApiProperty({
    example: EmployeeType.FARM_MANAGER,
    description: "Employee's role in the farm",
    enum: EmployeeType,
  })
  type: EmployeeType;

  constructor(partial: Partial<EmployeeDto>) {
    Object.assign(this, partial);
  }
}

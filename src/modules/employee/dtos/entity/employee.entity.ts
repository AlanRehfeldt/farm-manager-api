import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmployeeType } from '@prisma/client';

export class EmployeeDto {
  @ApiProperty({
    example: 'uuid',
    description: "Employee's unique identifier",
  })
  id!: string;

  @ApiProperty({
    example: 'uuid',
    description: "Employee's organization identifier",
  })
  organizationId!: string;

  @ApiPropertyOptional({
    example: 'uuid',
    nullable: true,
    description: 'When set, employee is visible only on this farm',
  })
  farmId?: string | null;

  @ApiProperty({
    example: 'John Doe',
    description: "Employee's name",
  })
  name!: string;

  @ApiProperty({
    example: '123456',
    description: "Employee's registration",
  })
  registration!: string;

  @ApiProperty({
    example: EmployeeType.FARM_MANAGER,
    description: "Employee's role in the farm",
    enum: EmployeeType,
  })
  type!: EmployeeType;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: "Employee's creation date",
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: "Employee's update date",
  })
  updatedAt!: Date;

  constructor(partial: Partial<EmployeeDto>) {
    Object.assign(this, partial);
  }
}

import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { EmployeeDto } from '../entity/employee.entity';

export class CreateEmployeeResponseDto {
  @ApiProperty({
    default: HttpStatus.CREATED,
  })
  statusCode!: string;

  @ApiProperty({
    default: 'Employee created successfully',
  })
  message!: string;

  @ApiProperty()
  result!: EmployeeDto;
}

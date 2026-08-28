import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { EmployeeDto } from '../entity/employee.entity';

export class UpdateEmployeeResponseDto {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode!: string;

  @ApiProperty({
    default: 'Employee updated successfully',
  })
  message!: string;

  @ApiProperty()
  result!: EmployeeDto;
}

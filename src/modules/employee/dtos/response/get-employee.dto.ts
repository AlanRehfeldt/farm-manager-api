import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { EmployeeDto } from '../entity/employee.entity';

export class GetEmployeeResponseDto {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode: string;

  @ApiProperty({
    default: 'Employee retrived successfully',
  })
  message: string;

  @ApiProperty()
  result: EmployeeDto;
}

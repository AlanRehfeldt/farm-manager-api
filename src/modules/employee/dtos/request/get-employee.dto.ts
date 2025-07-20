import { ApiProperty } from '@nestjs/swagger';

export class GetEmployeeParamDto {
  @ApiProperty({
    description: "Employee's unique identifier",
  })
  id: string;
}

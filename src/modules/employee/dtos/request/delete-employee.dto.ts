import { ApiProperty } from '@nestjs/swagger';

export class DeleteEmployeeParamDto {
  @ApiProperty({
    description: "Employee's unique identifier",
  })
  id!: string;
}

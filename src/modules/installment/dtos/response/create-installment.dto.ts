import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { InstallmentDto } from '../entity/installment.entity';

export class CreateInstallmentResponseDto {
  @ApiProperty({
    default: HttpStatus.CREATED,
  })
  statusCode: string;

  @ApiProperty({
    default: 'Installment created successfully',
  })
  message: string;

  @ApiProperty()
  result: InstallmentDto;
}

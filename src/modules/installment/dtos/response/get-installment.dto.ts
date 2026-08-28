import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { InstallmentDto } from '../entity/installment.entity';

export class GetInstallmentResponseDto {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode!: string;

  @ApiProperty({
    default: 'Installment retrived successfully',
  })
  message!: string;

  @ApiProperty()
  result!: InstallmentDto;
}

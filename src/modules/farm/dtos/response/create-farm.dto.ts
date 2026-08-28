import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { FarmDto } from '../entity/farm.entity';

export class CreateFarmResponseDto {
  @ApiProperty({ default: HttpStatus.CREATED })
  statusCode!: number;

  @ApiProperty({ default: 'Farm created successfully' })
  message!: string;

  @ApiProperty({ type: FarmDto })
  result!: FarmDto;
}

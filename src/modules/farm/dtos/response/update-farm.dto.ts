import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { FarmDto } from '../entity/farm.entity';

export class UpdateFarmResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Farm updated successfully' })
  message!: string;

  @ApiProperty({ type: FarmDto })
  result!: FarmDto;
}

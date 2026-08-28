import { ApiProperty } from '@nestjs/swagger';

export class GetFarmParamDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;
}

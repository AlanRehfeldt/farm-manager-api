import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { MachineDto } from '../entity/machine.entity';

export class CreateMachineResponseDto {
  @ApiProperty({ default: HttpStatus.CREATED })
  statusCode!: number;

  @ApiProperty({ default: 'Machine created successfully' })
  message!: string;

  @ApiProperty()
  result!: MachineDto;
}

export class GetMachineResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Machine retrieved successfully' })
  message!: string;

  @ApiProperty()
  result!: MachineDto;
}

export class UpdateMachineResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Machine updated successfully' })
  message!: string;

  @ApiProperty()
  result!: MachineDto;
}

export class DeleteMachineResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Machine deleted successfully' })
  message!: string;

  @ApiProperty({ nullable: true })
  result!: null;
}

export class FetchMachinesResponseDto {
  @ApiProperty({ type: [MachineDto] })
  results!: MachineDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  perPage!: number;

  @ApiProperty()
  orderBy!: string;

  @ApiProperty()
  orderDirection!: string;
}

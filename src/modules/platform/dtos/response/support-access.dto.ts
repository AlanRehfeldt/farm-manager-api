import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  AuditLogDto,
  SupportAccessDto,
  SupportUserDto,
} from '../entity/support-access.entity';

export class CreateSupportUserResponseDto {
  @ApiProperty({ default: HttpStatus.CREATED })
  statusCode!: number;

  @ApiProperty()
  message!: string;

  @ApiProperty({ type: SupportUserDto })
  result!: SupportUserDto;
}

export class GrantSupportAccessResponseDto {
  @ApiProperty({ default: HttpStatus.CREATED })
  statusCode!: number;

  @ApiProperty()
  message!: string;

  @ApiProperty({ type: SupportAccessDto })
  result!: SupportAccessDto;
}

export class RevokeSupportAccessResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty()
  message!: string;

  @ApiProperty({ type: SupportAccessDto })
  result!: SupportAccessDto;
}

export class FetchSupportUsersResponseDto {
  @ApiProperty({ type: [SupportUserDto] })
  results!: SupportUserDto[];

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

export class FetchSupportAccessResponseDto {
  @ApiProperty({ type: [SupportAccessDto] })
  results!: SupportAccessDto[];

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

export class FetchAuditLogsResponseDto {
  @ApiProperty({ type: [AuditLogDto] })
  results!: AuditLogDto[];

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

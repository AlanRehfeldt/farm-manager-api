import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class FetchMembershipsQueryDto {
  @ApiPropertyOptional()
  organizationId?: string;

  @ApiPropertyOptional()
  farmId?: string;

  @ApiPropertyOptional()
  userId?: string;

  @ApiPropertyOptional({ enum: Role })
  role?: Role;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  perPage?: number;

  @ApiPropertyOptional()
  orderBy?: string;

  @ApiPropertyOptional()
  orderDirection?: 'asc' | 'desc';
}

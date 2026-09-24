import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { FarmAdmin } from 'src/common/tenancy/farm-admin.decorator';
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { CloseLaborMonthService } from '../services/labor-month-closing.service';

const closeBodySchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
});

class CloseLaborMonthBodyDto {
  @ApiProperty({ example: 2026 })
  year!: number;

  @ApiProperty({ example: 9 })
  month!: number;
}

class ClosedEmployeeDto {
  @ApiProperty()
  employeeId!: string;

  @ApiProperty()
  employeeName!: string;

  @ApiProperty()
  salaryInCents!: number;

  @ApiProperty()
  totalHours!: string;

  @ApiProperty()
  closingId!: string;
}

class CloseLaborMonthResultDto {
  @ApiProperty()
  year!: number;

  @ApiProperty()
  month!: number;

  @ApiProperty()
  closedCount!: number;

  @ApiProperty({ type: [ClosedEmployeeDto] })
  employees!: ClosedEmployeeDto[];
}

class CloseLaborMonthResponseDto {
  @ApiProperty({ example: HttpStatus.CREATED })
  statusCode!: number;

  @ApiProperty()
  message!: string;

  @ApiProperty({ type: CloseLaborMonthResultDto })
  result!: CloseLaborMonthResultDto;
}

@ApiTags('LaborMonthClosing')
@FarmAdmin()
@Controller('/labor-month-closings')
export class CloseLaborMonthClosingController {
  constructor(
    private readonly closeLaborMonthService: CloseLaborMonthService,
  ) {}

  @ApiOperation({ summary: 'Close CLT labor month and post CostEntries' })
  @ApiCreatedResponse({ type: CloseLaborMonthResponseDto })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiConflictResponse({ type: ConflictDto })
  @Post()
  async close(
    @OrganizationId() organizationId: string,
    @CurrentUser() user: { userId: string },
    @Body(new ZodValidationPipe(closeBodySchema)) data: CloseLaborMonthBodyDto,
  ) {
    const result = await this.closeLaborMonthService.execute({
      organizationId,
      year: data.year,
      month: data.month,
      closedByUserId: user.userId,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Labor month closed successfully',
      result,
    };
  }
}

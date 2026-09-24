import { Body, Controller, HttpStatus, Param, Patch } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { ForbiddenDto } from 'src/common/errors/forbidden.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { ReopenLaborMonthClosingService } from '../services/reopen-labor-month-closing.service';

const paramSchema = z.object({ id: z.uuid() });

const bodySchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, 'Reason must have at least 3 characters')
    .max(500, 'Reason must have at most 500 characters'),
});

class ReopenLaborMonthClosingBodyDto {
  @ApiProperty({
    example: 'Estornei uma atividade e preciso redistribuir o salário',
  })
  reason!: string;
}

class ReopenLaborMonthClosingResultDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  employeeId!: string;

  @ApiProperty()
  year!: number;

  @ApiProperty()
  month!: number;

  @ApiProperty()
  salaryInCents!: number;

  @ApiProperty()
  totalHours!: string;
}

class ReopenLaborMonthClosingResponseDto {
  @ApiProperty({ example: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty()
  message!: string;

  @ApiProperty({ type: ReopenLaborMonthClosingResultDto })
  result!: ReopenLaborMonthClosingResultDto;
}

@ApiTags('LaborMonthClosing')
@FarmScoped()
@Controller('/labor-month-closings')
export class ReopenLaborMonthClosingController {
  constructor(
    private readonly reopenLaborMonthClosingService: ReopenLaborMonthClosingService,
  ) {}

  @ApiOperation({
    summary: 'Reopen CLT labor month closing and reverse posted CostEntries',
  })
  @ApiOkResponse({ type: ReopenLaborMonthClosingResponseDto })
  @ApiNotFoundResponse({ type: NotFoundDto })
  @ApiConflictResponse({ type: ConflictDto })
  @ApiForbiddenResponse({ type: ForbiddenDto })
  @Patch(':id/reopen')
  async reopen(
    @OrganizationId() organizationId: string,
    @CurrentUser() user: { userId: string },
    @Param(new ZodValidationPipe(paramSchema)) param: { id: string },
    @Body(new ZodValidationPipe(bodySchema)) body: ReopenLaborMonthClosingBodyDto,
  ) {
    const result = await this.reopenLaborMonthClosingService.execute({
      organizationId,
      closingId: param.id,
      reason: body.reason,
      actorUserId: user.userId,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Labor month closing reopened successfully',
      result,
    };
  }
}

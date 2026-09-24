import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { PreviewLaborMonthClosingService } from '../services/labor-month-closing.service';

const previewQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

class LaborClosingPreviewEmployeeDto {
  @ApiProperty()
  employeeId!: string;

  @ApiProperty()
  employeeName!: string;

  @ApiProperty()
  salaryInCents!: number;

  @ApiProperty()
  totalHours!: string;

  @ApiProperty()
  hourlyCostInCents!: number;

  @ApiProperty()
  lineCount!: number;
}

class LaborClosingPreviewClosingDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  employeeId!: string;

  @ApiProperty()
  employeeName!: string;

  @ApiProperty()
  salaryInCents!: number;

  @ApiProperty()
  totalHours!: string;

  @ApiProperty()
  closedAt!: string;
}

class LaborClosingPreviewResultDto {
  @ApiProperty()
  year!: number;

  @ApiProperty()
  month!: number;

  @ApiProperty({ type: [LaborClosingPreviewEmployeeDto] })
  employees!: LaborClosingPreviewEmployeeDto[];

  @ApiProperty({ type: [LaborClosingPreviewClosingDto] })
  closings!: LaborClosingPreviewClosingDto[];
}

class PreviewLaborMonthClosingResponseDto {
  @ApiProperty({ example: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty()
  message!: string;

  @ApiProperty({ type: LaborClosingPreviewResultDto })
  result!: LaborClosingPreviewResultDto;
}

@ApiTags('LaborMonthClosing')
@FarmScoped()
@Controller('/labor-month-closings')
export class PreviewLaborMonthClosingController {
  constructor(
    private readonly previewLaborMonthClosingService: PreviewLaborMonthClosingService,
  ) {}

  @ApiOperation({ summary: 'Preview CLT labor month closing dilution' })
  @ApiOkResponse({ type: PreviewLaborMonthClosingResponseDto })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @Get('preview')
  async preview(
    @OrganizationId() organizationId: string,
    @CurrentUser() user: { userId: string },
    @Query(new ZodValidationPipe(previewQuerySchema))
    query: z.infer<typeof previewQuerySchema>,
  ) {
    const result = await this.previewLaborMonthClosingService.execute(
      organizationId,
      query.year,
      query.month,
      user.userId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Labor month closing preview',
      result,
    };
  }
}

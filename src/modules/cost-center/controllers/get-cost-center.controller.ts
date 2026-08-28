import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { GetCostCenterParamDto } from '../dtos/request/get-cost-center.dto';
import { GetCostCenterResponseDto } from '../dtos/response/get-cost-center.dto';
import { GetCostCenterService } from '../services/get-cost-center.service';

const getCostCenterParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('CostCenter')
@FarmScoped()
@Controller('/cost-centers')
export class GetCostCenterController {
  constructor(private readonly getCostCenterService: GetCostCenterService) {}

  @ApiOperation({ summary: 'Get cost center' })
  @ApiOkResponse({
    description: 'Cost center retrieved successfully',
    type: GetCostCenterResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Cost center does not exist',
    type: NotFoundDto,
  })
  @Get(':id')
  async get(
    @OrganizationId() organizationId: string,
    @Param(new ZodValidationPipe(getCostCenterParamSchema))
    param: GetCostCenterParamDto,
  ) {
    const { costCenter } = await this.getCostCenterService.execute(
      param.id,
      organizationId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Cost center retrieved successfully',
      result: costCenter,
    };
  }
}

import { Controller, Delete, HttpStatus, Param } from '@nestjs/common';
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
import { DeleteCostCenterParamDto } from '../dtos/request/delete-cost-center.dto';
import { DeleteCostCenterResponseDto } from '../dtos/response/delete-cost-center.dto';
import { DeleteCostCenterService } from '../services/delete-cost-center.service';

const deleteCostCenterParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('CostCenter')
@FarmScoped()
@Controller('/cost-centers')
export class DeleteCostCenterController {
  constructor(
    private readonly deleteCostCenterService: DeleteCostCenterService,
  ) {}

  @ApiOperation({ summary: 'Delete cost center' })
  @ApiOkResponse({
    description: 'Cost center deleted successfully',
    type: DeleteCostCenterResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Cost center does not exist',
    type: NotFoundDto,
  })
  @Delete(':id')
  async delete(
    @OrganizationId() organizationId: string,
    @Param(new ZodValidationPipe(deleteCostCenterParamSchema))
    param: DeleteCostCenterParamDto,
  ) {
    await this.deleteCostCenterService.execute(param.id, organizationId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Cost center deleted successfully',
      result: null,
    };
  }
}

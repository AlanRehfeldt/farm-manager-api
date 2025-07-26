import { Controller, Delete, HttpStatus, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { DeleteCostCenterService } from '../services/delete-cost-center.service';
import { DeleteCostCenterParamDto } from '../dtos/request/delete-cost-center.dto';
import { DeleteCostCenterResponseDto } from '../dtos/response/delete-cost-center.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';

const deleteCostCenterParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('CostCenter')
@Controller('/cost-centers')
export class DeleteCostCenterController {
  constructor(
    private readonly deleteCostCenterService: DeleteCostCenterService,
  ) {}

  @ApiOperation({ summary: 'Delete cost center' })
  @ApiCreatedResponse({
    description: 'Cost center deleted successfully',
    type: DeleteCostCenterResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'CostCenter does not exist',
    type: NotFoundDto,
  })
  @Delete(':id')
  async delete(
    @Param(new ZodValidationPipe(deleteCostCenterParamSchema))
    param: DeleteCostCenterParamDto,
  ) {
    try {
      await this.deleteCostCenterService.execute(param.id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Cost center deleted successfully',
        result: null,
      };
    } catch (error) {
      console.error('Error deleting cost center', error);
      throw error;
    }
  }
}

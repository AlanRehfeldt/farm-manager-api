import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { GetCostCenterService } from '../services/get-cost-center.service';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { GetCostCenterParamDto } from '../dtos/request/get-cost-center.dto';
import { GetCostCenterResponseDto } from '../dtos/response/get-cost-center.dto';

const getCostCenterParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('CostCenter')
@Controller('/cost-centers')
export class GetCostCenterController {
  constructor(private readonly getCostCenterService: GetCostCenterService) {}

  @ApiOperation({ summary: 'Get cost center' })
  @ApiOkResponse({
    description: 'Cost center retrived successfully',
    type: GetCostCenterResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Cost center does not exist',
    type: NotFoundDto,
  })
  @Get(':id')
  async get(
    @Param(new ZodValidationPipe(getCostCenterParamSchema))
    param: GetCostCenterParamDto,
  ) {
    try {
      const { costcenter } = await this.getCostCenterService.execute(param.id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Cost center retrived successfully',
        costcenter,
      };
    } catch (error) {
      console.error('Error getting cost center', error);
      throw error;
    }
  }
}

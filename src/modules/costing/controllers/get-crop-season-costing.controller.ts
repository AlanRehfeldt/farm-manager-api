import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { GetCropSeasonCostingResponseDto } from '../dtos/response/costing-response.dto';
import { GetCropSeasonCostingService } from '../services/get-crop-season-costing.service';

const paramSchema = z.object({ id: z.uuid() });

@ApiTags('Costing')
@FarmScoped()
@Controller('/crop-seasons')
export class GetCropSeasonCostingController {
  constructor(
    private readonly getCropSeasonCostingService: GetCropSeasonCostingService,
  ) {}

  @ApiOperation({ summary: 'Get crop season costing report' })
  @ApiOkResponse({
    description: 'Crop season costing retrieved successfully',
    type: GetCropSeasonCostingResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Crop season does not exist',
    type: NotFoundDto,
  })
  @Get(':id/costing')
  async get(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(paramSchema)) param: { id: string },
  ) {
    const { costing } = await this.getCropSeasonCostingService.execute(
      param.id,
      farmId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Crop season costing retrieved successfully',
      result: costing,
    };
  }
}

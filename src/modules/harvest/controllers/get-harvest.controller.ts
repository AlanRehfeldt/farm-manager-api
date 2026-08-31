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
import { GetHarvestResponseDto } from '../dtos/response/harvest-response.dto';
import { GetHarvestService } from '../services/get-harvest.service';

const idSchema = z.object({ id: z.uuid() });

@ApiTags('Harvest')
@FarmScoped()
@Controller('/harvests')
export class GetHarvestController {
  constructor(private readonly getHarvestService: GetHarvestService) {}

  @ApiOperation({ summary: 'Get harvest by id' })
  @ApiOkResponse({
    description: 'Harvest retrieved successfully',
    type: GetHarvestResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Harvest does not exist',
    type: NotFoundDto,
  })
  @Get('/:id')
  async get(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(idSchema)) params: { id: string },
  ) {
    const { harvest } = await this.getHarvestService.execute({
      id: params.id,
      farmId,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Harvest retrieved successfully',
      result: harvest,
    };
  }
}

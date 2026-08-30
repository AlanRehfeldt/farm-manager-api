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
import { GetActivityResponseDto } from '../dtos/response/activity-response.dto';
import { GetActivityService } from '../services/get-activity.service';

const idSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Activity')
@FarmScoped()
@Controller('/activities')
export class GetActivityController {
  constructor(private readonly getActivityService: GetActivityService) {}

  @ApiOperation({ summary: 'Get activity by id' })
  @ApiOkResponse({
    description: 'Activity retrieved successfully',
    type: GetActivityResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Activity does not exist',
    type: NotFoundDto,
  })
  @Get(':id')
  async get(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(idSchema)) params: { id: string },
  ) {
    const { activity } = await this.getActivityService.execute(
      params.id,
      farmId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Activity retrieved successfully',
      result: activity,
    };
  }
}

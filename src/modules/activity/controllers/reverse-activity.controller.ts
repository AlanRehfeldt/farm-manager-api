import { Body, Controller, HttpStatus, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { GetActivityResponseDto } from '../dtos/response/activity-response.dto';
import { ReverseActivityService } from '../services/reverse-activity.service';

const activityIdSchema = z.object({
  id: z.uuid(),
});

const reverseActivityBodySchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, { message: 'Reason must be at least 3 characters' })
    .max(500, { message: 'Reason must be at most 500 characters' }),
});

@ApiTags('Activity')
@FarmScoped()
@Controller('/activities')
export class ReverseActivityController {
  constructor(
    private readonly reverseActivityService: ReverseActivityService,
  ) {}

  @ApiOperation({ summary: 'Reverse activity (stock IN + cost reversal)' })
  @ApiOkResponse({
    description: 'Activity reversed successfully',
    type: GetActivityResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Activity does not exist',
    type: NotFoundDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Season closed, already reversed or no cost entries',
  })
  @Post(':id/reverse')
  async reverse(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(activityIdSchema))
    params: { id: string },
    @Body(new ZodValidationPipe(reverseActivityBodySchema))
    body: { reason: string },
  ) {
    const { activity } = await this.reverseActivityService.execute({
      activityId: params.id,
      farmId,
      reason: body.reason,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Activity reversed successfully',
      result: activity,
    };
  }
}

import { Body, Controller, HttpStatus, Param, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
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
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import {
  UpdateVarietyBodyDto,
  UpdateVarietyParamDto,
} from '../dtos/request/variety-request.dto';
import { UpdateVarietyResponseDto } from '../dtos/response/variety-response.dto';
import { UpdateVarietyService } from '../services/update-variety.service';

const updateVarietyParamSchema = z.object({ id: z.uuid() });

const updateVarietyBodySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name must be at least 1 character long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' })
    .optional(),
  externalRef: z.string().max(100).nullable().optional(),
});

@ApiTags('Variety')
@FarmScoped()
@Controller('/varieties')
export class UpdateVarietyController {
  constructor(private readonly updateVarietyService: UpdateVarietyService) {}

  @ApiOperation({ summary: 'Update variety' })
  @ApiOkResponse({
    description: 'Variety updated successfully',
    type: UpdateVarietyResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Variety name already exists',
    type: ConflictDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Variety does not exist',
    type: NotFoundDto,
  })
  @Put(':id')
  async update(
    @OrganizationId() organizationId: string,
    @Param(new ZodValidationPipe(updateVarietyParamSchema))
    param: UpdateVarietyParamDto,
    @Body(new ZodValidationPipe(updateVarietyBodySchema))
    data: UpdateVarietyBodyDto,
  ) {
    const { variety } = await this.updateVarietyService.execute({
      id: param.id,
      ...data,
      organizationId,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Variety updated successfully',
      result: variety,
    };
  }
}

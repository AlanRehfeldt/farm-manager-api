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
  UpdateCropBodyDto,
  UpdateCropParamDto,
} from '../dtos/request/crop-request.dto';
import { UpdateCropResponseDto } from '../dtos/response/crop-response.dto';
import { UpdateCropService } from '../services/update-crop.service';

const updateCropParamSchema = z.object({ id: z.uuid() });

const updateCropBodySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name must be at least 1 character long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' })
    .optional(),
  defaultProductionUomId: z.uuid().nullable().optional(),
  externalRef: z.string().max(100).nullable().optional(),
});

@ApiTags('Crop')
@FarmScoped()
@Controller('/crops')
export class UpdateCropController {
  constructor(private readonly updateCropService: UpdateCropService) {}

  @ApiOperation({ summary: 'Update crop' })
  @ApiOkResponse({
    description: 'Crop updated successfully',
    type: UpdateCropResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Crop name already exists',
    type: ConflictDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Crop or unit of measurement does not exist',
    type: NotFoundDto,
  })
  @Put(':id')
  async update(
    @OrganizationId() organizationId: string,
    @Param(new ZodValidationPipe(updateCropParamSchema))
    param: UpdateCropParamDto,
    @Body(new ZodValidationPipe(updateCropBodySchema))
    data: UpdateCropBodyDto,
  ) {
    const { crop } = await this.updateCropService.execute({
      id: param.id,
      ...data,
      organizationId,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Crop updated successfully',
      result: crop,
    };
  }
}

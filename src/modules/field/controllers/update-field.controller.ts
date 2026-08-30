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
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import {
  UpdateFieldBodyDto,
  UpdateFieldParamDto,
} from '../dtos/request/field-request.dto';
import { UpdateFieldResponseDto } from '../dtos/response/field-response.dto';
import { UpdateFieldService } from '../services/update-field.service';

const updateFieldParamSchema = z.object({ id: z.uuid() });

const updateFieldBodySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name must be at least 1 character long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' })
    .optional(),
  areaHa: z.union([z.string(), z.number()]).optional(),
  active: z.boolean().optional(),
  plantsPerHa: z.union([z.string(), z.number()]).nullable().optional(),
  plantedYear: z.number().int().nullable().optional(),
  spacingNote: z.string().max(250).nullable().optional(),
  externalRef: z.string().max(100).nullable().optional(),
});

@ApiTags('Field')
@FarmScoped()
@Controller('/fields')
export class UpdateFieldController {
  constructor(private readonly updateFieldService: UpdateFieldService) {}

  @ApiOperation({ summary: 'Update field' })
  @ApiOkResponse({
    description: 'Field updated successfully',
    type: UpdateFieldResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Field name already exists',
    type: ConflictDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Field does not exist',
    type: NotFoundDto,
  })
  @Put(':id')
  async update(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(updateFieldParamSchema))
    param: UpdateFieldParamDto,
    @Body(new ZodValidationPipe(updateFieldBodySchema))
    data: UpdateFieldBodyDto,
  ) {
    const { field } = await this.updateFieldService.execute({
      id: param.id,
      ...data,
      farmId,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Field updated successfully',
      result: field,
    };
  }
}

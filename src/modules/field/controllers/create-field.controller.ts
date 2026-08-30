import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { CreateFieldBodyDto } from '../dtos/request/create-field.dto';
import { CreateFieldResponseDto } from '../dtos/response/field-response.dto';
import { CreateFieldService } from '../services/create-field.service';

const createFieldBodySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name must be at least 1 character long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' }),
  areaHa: z.union([z.string(), z.number()]),
  active: z.boolean().optional(),
  plantsPerHa: z.union([z.string(), z.number()]).nullable().optional(),
  plantedYear: z.number().int().nullable().optional(),
  spacingNote: z.string().max(250).nullable().optional(),
  externalRef: z.string().max(100).nullable().optional(),
});

@ApiTags('Field')
@FarmScoped()
@Controller('/fields')
export class CreateFieldController {
  constructor(private readonly createFieldService: CreateFieldService) {}

  @ApiOperation({ summary: 'Create field' })
  @ApiCreatedResponse({
    description: 'Field created successfully',
    type: CreateFieldResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Field name already exists',
    type: ConflictDto,
  })
  @Post()
  async create(
    @FarmId() farmId: string,
    @Body(new ZodValidationPipe(createFieldBodySchema))
    data: CreateFieldBodyDto,
  ) {
    const { field } = await this.createFieldService.execute({
      ...data,
      farmId,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Field created successfully',
      result: field,
    };
  }
}

import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
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
import { CreateHarvestBodyDto } from '../dtos/request/harvest.dto';
import { CreateHarvestResponseDto } from '../dtos/response/harvest-response.dto';
import { CreateHarvestService } from '../services/create-harvest.service';

const qualityClassSchema = z.enum([
  'EXPORT',
  'DOMESTIC',
  'INDUSTRY',
  'REJECT',
  'OTHER',
]);

const createHarvestBodySchema = z.object({
  cropSeasonId: z.uuid(),
  fieldId: z.uuid(),
  date: z.coerce.date(),
  lotCode: z.string().optional(),
  note: z.string().optional(),
  items: z
    .array(
      z.object({
        qualityClass: qualityClassSchema.default('OTHER'),
        quantity: z
          .string()
          .min(1)
          .refine(
            (value) => !Number.isNaN(Number(value)) && Number(value) > 0,
            { message: 'Quantity must be greater than zero' },
          ),
        uomId: z.uuid().optional(),
      }),
    )
    .min(1),
});

@ApiTags('Harvest')
@FarmScoped()
@Controller('/harvests')
export class CreateHarvestController {
  constructor(private readonly createHarvestService: CreateHarvestService) {}

  @ApiOperation({ summary: 'Record harvest volume for a crop season field' })
  @ApiCreatedResponse({
    description: 'Harvest created successfully',
    type: CreateHarvestResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Crop season does not exist',
    type: NotFoundDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Crop season is not active',
    type: ConflictDto,
  })
  @Post()
  async create(
    @FarmId() farmId: string,
    @Body(new ZodValidationPipe(createHarvestBodySchema))
    data: CreateHarvestBodyDto,
  ) {
    const { harvest } = await this.createHarvestService.execute({
      ...data,
      farmId,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Harvest created successfully',
      result: harvest,
    };
  }
}

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
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { CreateVarietyBodyDto } from '../dtos/request/create-variety.dto';
import { CreateVarietyResponseDto } from '../dtos/response/variety-response.dto';
import { CreateVarietyService } from '../services/create-variety.service';

const createVarietyBodySchema = z.object({
  cropId: z.uuid(),
  name: z
    .string()
    .min(1, { message: 'Name must be at least 1 character long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' }),
  externalRef: z.string().max(100).nullable().optional(),
});

@ApiTags('Variety')
@FarmScoped()
@Controller('/varieties')
export class CreateVarietyController {
  constructor(private readonly createVarietyService: CreateVarietyService) {}

  @ApiOperation({ summary: 'Create variety' })
  @ApiCreatedResponse({
    description: 'Variety created successfully',
    type: CreateVarietyResponseDto,
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
    description: 'Not found: Crop does not exist',
    type: NotFoundDto,
  })
  @Post()
  async create(
    @OrganizationId() organizationId: string,
    @Body(new ZodValidationPipe(createVarietyBodySchema))
    data: CreateVarietyBodyDto,
  ) {
    const { variety } = await this.createVarietyService.execute({
      ...data,
      organizationId,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Variety created successfully',
      result: variety,
    };
  }
}

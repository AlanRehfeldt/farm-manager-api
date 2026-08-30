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
import { CreateMachineBodyDto } from '../dtos/request/create-machine.dto';
import { CreateMachineResponseDto } from '../dtos/response/machine-response.dto';
import { CreateMachineService } from '../services/create-machine.service';

const createMachineBodySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name must be at least 1 character long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' }),
  hourlyCostInCents: z.number().int(),
  fuelIncludedInHourlyCost: z.boolean().optional(),
  active: z.boolean().optional(),
});

@ApiTags('Machine')
@FarmScoped()
@Controller('/machines')
export class CreateMachineController {
  constructor(private readonly createMachineService: CreateMachineService) {}

  @ApiOperation({ summary: 'Create machine' })
  @ApiCreatedResponse({
    description: 'Machine created successfully',
    type: CreateMachineResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Machine name already exists',
    type: ConflictDto,
  })
  @Post()
  async create(
    @FarmId() farmId: string,
    @Body(new ZodValidationPipe(createMachineBodySchema))
    data: CreateMachineBodyDto,
  ) {
    const { machine } = await this.createMachineService.execute({
      ...data,
      farmId,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Machine created successfully',
      result: machine,
    };
  }
}

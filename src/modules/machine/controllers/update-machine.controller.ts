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
  UpdateMachineBodyDto,
  UpdateMachineParamDto,
} from '../dtos/request/machine-request.dto';
import { UpdateMachineResponseDto } from '../dtos/response/machine-response.dto';
import { UpdateMachineService } from '../services/update-machine.service';

const updateMachineParamSchema = z.object({ id: z.uuid() });

const updateMachineBodySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name must be at least 1 character long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' })
    .optional(),
  hourlyCostInCents: z.number().int().optional(),
  fuelIncludedInHourlyCost: z.boolean().optional(),
  active: z.boolean().optional(),
});

@ApiTags('Machine')
@FarmScoped()
@Controller('/machines')
export class UpdateMachineController {
  constructor(private readonly updateMachineService: UpdateMachineService) {}

  @ApiOperation({ summary: 'Update machine' })
  @ApiOkResponse({
    description: 'Machine updated successfully',
    type: UpdateMachineResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Machine name already exists',
    type: ConflictDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Machine does not exist',
    type: NotFoundDto,
  })
  @Put(':id')
  async update(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(updateMachineParamSchema))
    param: UpdateMachineParamDto,
    @Body(new ZodValidationPipe(updateMachineBodySchema))
    data: UpdateMachineBodyDto,
  ) {
    const { machine } = await this.updateMachineService.execute({
      id: param.id,
      ...data,
      farmId,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Machine updated successfully',
      result: machine,
    };
  }
}

import { Body, Controller, HttpStatus, Param, Put } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmAdmin } from 'src/common/tenancy/farm-admin.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { numberToBigint } from 'src/common/serialization/money';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { UpdateReferencePriceBodyDto } from '../dtos/request/costing.dto';
import { UpdateReferencePriceResponseDto } from '../dtos/response/costing-response.dto';
import { UpdateReferencePriceService } from '../services/update-reference-price.service';

const paramSchema = z.object({ id: z.uuid() });

const bodySchema = z.object({
  referenceSalePriceInCents: z.number().int().min(0).nullable(),
});

@ApiTags('Costing')
@FarmScoped()
@FarmAdmin()
@Controller('/crop-seasons')
export class UpdateReferencePriceController {
  constructor(
    private readonly updateReferencePriceService: UpdateReferencePriceService,
  ) {}

  @ApiOperation({ summary: 'Update crop season reference sale price' })
  @ApiOkResponse({
    description: 'Reference price updated successfully',
    type: UpdateReferencePriceResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Crop season does not exist',
    type: NotFoundDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Closed crop season cannot be updated',
    type: ConflictDto,
  })
  @Put(':id/reference-price')
  async update(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(paramSchema)) param: { id: string },
    @Body(new ZodValidationPipe(bodySchema))
    body: UpdateReferencePriceBodyDto,
  ) {
    const referenceSalePriceInCents =
      body.referenceSalePriceInCents != null
        ? numberToBigint(body.referenceSalePriceInCents)
        : null;

    const { costing } = await this.updateReferencePriceService.execute(
      param.id,
      farmId,
      referenceSalePriceInCents,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Reference price updated successfully',
      result: costing,
    };
  }
}

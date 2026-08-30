import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { GetPurchaseResponseDto } from '../dtos/response/purchase-response.dto';
import { GetPurchaseService } from '../services/get-purchase.service';

const idSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Purchase')
@FarmScoped()
@Controller('/purchases')
export class GetPurchaseController {
  constructor(private readonly getPurchaseService: GetPurchaseService) {}

  @ApiOperation({ summary: 'Get purchase by id' })
  @ApiOkResponse({
    description: 'Purchase retrieved successfully',
    type: GetPurchaseResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Purchase does not exist',
    type: NotFoundDto,
  })
  @Get(':id')
  async get(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(idSchema)) params: { id: string },
  ) {
    const { purchase } = await this.getPurchaseService.execute(
      params.id,
      farmId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Purchase retrieved successfully',
      result: purchase,
    };
  }
}

import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { GetSupplierParamDto } from '../dtos/request/get-supplier.dto';
import { GetSupplierResponseDto } from '../dtos/response/get-supplier.dto';
import { GetSupplierService } from '../services/get-supplier.service';

const getSupplierParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Supplier')
@FarmScoped()
@Controller('/suppliers')
export class GetSupplierController {
  constructor(private readonly getSupplierService: GetSupplierService) {}

  @ApiOperation({ summary: 'Get supplier' })
  @ApiOkResponse({
    description: 'Supplier retrieved successfully',
    type: GetSupplierResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Supplier does not exist',
    type: NotFoundDto,
  })
  @Get(':id')
  async get(
    @OrganizationId() organizationId: string,
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(getSupplierParamSchema))
    param: GetSupplierParamDto,
  ) {
    const { supplier } = await this.getSupplierService.execute(
      param.id,
      organizationId,
      farmId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Supplier retrieved successfully',
      result: supplier,
    };
  }
}
